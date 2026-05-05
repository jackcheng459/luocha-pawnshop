import { useEffect, useReducer, useRef, useState } from "react";
import { DoorOpen, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CrisisFallback } from "./components/CrisisFallback";
import { DoorTransition } from "./components/DoorTransition";
import { EntryQuestion } from "./components/EntryQuestion";
import { FateCard } from "./components/FateCard";
import { FateRitual } from "./components/FateRitual";
import { ItemShelf } from "./components/ItemShelf";
import { ItemObtainOverlay } from "./components/ItemObtainOverlay";
import { LotDrawer } from "./components/LotDrawer";
import { OpeningScene } from "./components/OpeningScene";
import { PawnForm } from "./components/PawnForm";
import { PhraseAdmin } from "./components/PhraseAdmin";
import { ReceiptAssemble } from "./components/ReceiptAssemble";
import { ResourceLedger } from "./components/ResourceLedger";
import { ShareButton } from "./components/ShareButton";
import { SceneImage } from "./components/SceneImage";
import { ShopScene } from "./components/ShopScene";
import { ShopkeeperDialog } from "./components/ShopkeeperDialog";
import { ShowcasePoster } from "./components/ShowcasePoster";
import { SoundToggle } from "./components/SoundToggle";
import { StoryPage } from "./components/StoryPage";
import { StoryLedger } from "./components/StoryLedger";
import { TransitionVeil } from "./components/TransitionVeil";
import { items } from "./data/items";
import type { EntryIntent, Item, PawnInput, ResourceMap } from "./data/types";
import { checkSafety } from "./game/compliance";
import { fallbackFate } from "./game/fate";
import { gameReducer, initialState } from "./game/reducer";
import {
  applyPrice,
  applySideEffects,
  canAfford,
  drawLot,
  generateInitialResources
} from "./game/rules";
import { fallbackPawnResult, fallbackReceiptResult } from "./services/fallback";
import { requestFate, requestPawn, requestReceipt } from "./services/llmClient";
import { audioEngine } from "./services/audioEngine";
import { createFateStory } from "./services/storyClient";
import { capturePawnContribution } from "./services/contributionClient";

export default function App() {
  if (window.location.pathname === "/showcase") {
    return <ShowcasePoster />;
  }
  if (window.location.pathname === "/admin/phrases") {
    return <PhraseAdmin />;
  }
  if (window.location.pathname.startsWith("/story/")) {
    const storyId = decodeURIComponent(window.location.pathname.replace("/story/", "").split("/")[0]);
    return <StoryPage storyId={storyId} />;
  }

  return <GameApp />;
}

function GameApp() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [introStage, setIntroStage] = useState<"opening" | "entering" | "question" | "ritual" | "fateLoading">("opening");
  const [entryIntent, setEntryIntent] = useState<EntryIntent>("relief");
  const [soundEnabled, setSoundEnabled] = useState(() => audioEngine.isEnabled());
  const [showPawnAgain, setShowPawnAgain] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | undefined>();
  const [obtained, setObtained] = useState<
    { item: Item; before: ResourceMap; after: ResourceMap } | undefined
  >();
  const fateRef = useRef<HTMLDivElement>(null);
  const receiptFateRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const ritualDoneRef = useRef(false);
  const lastPhaseRef = useRef(state.phase);
  const [veil, setVeil] = useState<{ stamp: string; text: string }>();
  const player = state.player;
  const screenKey = player ? state.phase : introStage;

  useEffect(() => {
    if (lastPhaseRef.current === state.phase) return;
    lastPhaseRef.current = state.phase;
    if (state.phase === "receipt") audioEngine.playReceipt();
    if (state.phase === "lotOffer") audioEngine.playLot();
  }, [state.phase]);

  useEffect(() => {
    if (!player || state.phase !== "receipt" || state.llm.receipt !== "idle") return;
    const fallback = fallbackReceiptResult(player);
    dispatch({ type: "SET_RECEIPT_LLM_LOADING" });
    requestReceipt(player).then((result) => {
      const llmUsed =
        result.farewell !== fallback.farewell ||
        result.story !== fallback.story ||
        result.storyTitle !== fallback.storyTitle ||
        result.verbsForTrades.some((verb, index) => verb !== fallback.verbsForTrades[index]);
      dispatch({ type: "SET_RECEIPT_RESULT", result, llmUsed });
    });
  }, [player, state.llm.receipt, state.phase]);

  useEffect(() => {
    if (!player || state.phase !== "receipt" || player.storyStatus !== "idle") return;
    dispatch({ type: "SET_STORY_LOADING" });
    createFateStory(player).then(({ record, storyQrUrl, storyUrl, usedFallback }) => {
      dispatch({ type: "SET_STORY_RESULT", story: record, storyQrUrl, storyUrl, usedFallback });
    });
  }, [player, state.phase]);

  useEffect(() => {
    if (!state.lastDialog || state.phase === "fateCard") return;
    setActiveDialog(state.lastDialog);
  }, [state.lastDialog, state.phase]);

  useEffect(() => {
    const text = transitionText(screenKey);
    if (!text) return;
    setVeil({ stamp: `${screenKey}-${Date.now()}`, text });
  }, [screenKey]);

  async function startGame() {
    if (ritualDoneRef.current) return;
    ritualDoneRef.current = true;
    audioEngine.playSeal();
    setIntroStage("fateLoading");
    const resources = generateInitialResources();
    const fate = await requestFate(resources, entryIntent);
    dispatch({ type: "START_WITH_FATE", entryIntent, resources, fate, llmLoading: false });
  }

  function changeFate() {
    audioEngine.playSeal();
    const resources = generateInitialResources();
    const fate = fallbackFate(resources);
    dispatch({ type: "CHANGE_FATE", resources, fate });
  }

  function submitPawn(input: PawnInput) {
    const safety = checkSafety(input.itemName, input.itemStory);
    if (!safety.ok) {
      audioEngine.playDeny();
      dispatch({ type: "SET_SAFETY_MESSAGE", message: safety.message });
      return;
    }

    const fallback = fallbackPawnResult(input);
    const isEntry = !player?.hasPawned;
    const promise = isEntry ? requestPawn(input) : Promise.resolve(fallback);
    promise.then((llmResult) => {
      audioEngine.playPawn();
      const llmUsed =
        isEntry &&
        (llmResult.renamedItem !== fallback.renamedItem ||
          llmResult.dialog !== fallback.dialog ||
          llmResult.ledgerLine !== fallback.ledgerLine);
      dispatch({ type: "COMPLETE_PAWN", input, llmResult, llmUsed });
      capturePawnContribution(player, input, llmResult);
      setShowPawnAgain(false);
    });
  }

  function endGame() {
    dispatch({ type: "GO_RECEIPT" });
  }

  function resetGame() {
    void audioEngine.unlock().then(() => audioEngine.playDoor());
    ritualDoneRef.current = false;
    setIntroStage("opening");
    setEntryIntent("relief");
    setShowPawnAgain(false);
    setActiveDialog(undefined);
    setObtained(undefined);
    dispatch({ type: "RESET" });
  }

  function handleBuy(itemId: number) {
    if (!player) return;
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    if (!canAfford(player.resources, item.price, player.priceMultiplier)) {
      audioEngine.playDeny();
      dispatch({ type: "BUY_ITEM", itemId });
      return;
    }
    const before = player.resources;
    const afterPrice = applyPrice(before, item.price, player.priceMultiplier);
    const after = applySideEffects(afterPrice, item.sideEffects);
    audioEngine.playCoin();
    dispatch({ type: "BUY_ITEM", itemId });
    setObtained({ item, before, after });
  }

  function enterShop() {
    void audioEngine.unlock().then(() => audioEngine.playDoor());
    setIntroStage("entering");
  }

  function chooseIntent(intent: EntryIntent) {
    audioEngine.playChoice();
    setEntryIntent(intent);
    setIntroStage("ritual");
  }

  function toggleSound() {
    void audioEngine.toggle().then((enabled) => setSoundEnabled(enabled));
  }

  function renderMain() {
    if (!player) {
      if (introStage === "opening") {
        return <OpeningScene onEnter={enterShop} />;
      }
      if (introStage === "entering") {
        return <DoorTransition onDone={() => setIntroStage("question")} />;
      }
      if (introStage === "question") {
        return <EntryQuestion onChoose={chooseIntent} />;
      }
      if (introStage === "fateLoading") {
        return (
          <section className="fate-loading-scene">
            <SceneImage
              alt="罗刹当铺店内"
              className="ritual-bg"
              fallbackClass="interior-fallback"
              src="/images/shop-interior-main.jpg"
            />
            <div className="ritual-vignette" />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="fate-loading-copy"
              initial={{ opacity: 0, y: 14 }}
            >
              <p>掌柜低头磨墨，命牌尚未落案。</p>
              <h2 className="title-brush">命数入纸</h2>
            </motion.div>
          </section>
        );
      }
      return (
        <FateRitual onComplete={startGame} />
      );
    }

    if (state.phase === "fateCard") {
      return (
        <section className="two-column">
          <div className="card-stage">
            <FateCard player={player} ref={fateRef} />
            <div className="action-row center">
              <ShareButton targetRef={fateRef} filename="罗刹当铺-命格卡.png" label="导出命格卡" />
              <button
                className="ghost-button"
                disabled={player.changedFate || player.resources.hui < 10}
                type="button"
                onClick={changeFate}
              >
                <RefreshCcw size={15} strokeWidth={1.8} />
                <span>改命一次，折慧一两</span>
              </button>
              <button
                className="seal-button"
                type="button"
                onClick={() => {
                  audioEngine.playPaper();
                  dispatch({ type: "GO_PAWN" });
                }}
              >
                入铺问价
              </button>
            </div>
          </div>
          <aside className="side-ledger">
            <ResourceLedger resources={player.resources} />
            <p>{state.llm.fate === "loading" ? "掌柜还在磨墨，先看这句像不像你。" : state.lastDialog}</p>
            <StoryLedger beats={player.storyBeats} />
          </aside>
        </section>
      );
    }

    if (state.phase === "pawnRequired") {
      return (
        <section className="two-column">
          <PawnForm
            canSellAgain={player.pawnCount < 2}
            isEntry={!player.hasPawned}
            resources={player.resources}
            onSubmit={submitPawn}
          />
          <aside className="side-ledger">
            <ResourceLedger resources={player.resources} />
            <StoryLedger beats={player.storyBeats} />
            <CrisisFallback
              message={state.safetyMessage}
              onClose={() => dispatch({ type: "SET_SAFETY_MESSAGE" })}
            />
          </aside>
        </section>
      );
    }

    if (state.phase === "shop") {
      return (
        <section className="game-layout">
          <aside className="shop-aside">
            <ShopScene />
            <ResourceLedger resources={player.resources} original={player.originalResources} />
            <p className="keeper-line">{state.lastDialog}</p>
            <StoryLedger beats={player.storyBeats} />
            <div className="action-stack">
              <button className="ghost-button" type="button" onClick={endGame}>
                <DoorOpen size={15} strokeWidth={1.8} />
                <span>结当离店</span>
              </button>
              <button
                className="ghost-button"
                disabled={player.pawnCount >= 2 || showPawnAgain}
                type="button"
                onClick={() => {
                  audioEngine.playPaper();
                  setShowPawnAgain(true);
                }}
              >
                再典一物
              </button>
            </div>
            {showPawnAgain ? (
              <PawnForm
                canSellAgain={player.pawnCount < 2}
                isEntry={false}
                resources={player.resources}
                onCancel={() => setShowPawnAgain(false)}
                onSubmit={submitPawn}
              />
            ) : null}
          </aside>
          <ItemShelf player={player} onBuy={handleBuy} />
        </section>
      );
    }

    if (state.phase === "lotOffer") {
      return (
        <LotDrawer
          onDraw={() => {
            audioEngine.playLot();
            dispatch({ type: "DRAW_LOT", result: drawLot() });
          }}
          onSkip={endGame}
        />
      );
    }

    if (state.phase === "receipt") {
      return (
        <section className="two-column">
          <div className="card-stage">
            <ReceiptAssemble player={player} cardRef={receiptRef} />
            <div className="offscreen-export">
              <FateCard player={player} ref={receiptFateRef} />
            </div>
            <div className="action-row center">
              <ShareButton targetRef={receiptRef} filename="罗刹当铺-当票卡.png" label="导出当票卡" />
              <ShareButton targetRef={receiptFateRef} filename="罗刹当铺-命格卡.png" label="导出命格卡" />
              <button
                className="seal-button"
                type="button"
                onClick={() => {
                  audioEngine.playLeave();
                  dispatch({ type: "LEAVE" });
                }}
              >
                离店
              </button>
            </div>
          </div>
          <aside className="side-ledger">
            <ResourceLedger resources={player.resources} original={player.originalResources} />
            <p>{state.llm.receipt === "loading" ? "掌柜正在落款，最后一句最不好写。" : player.farewell}</p>
            <p className="story-status-line">
              {player.storyStatus === "loading"
                ? "记账先生正在写一夜笔记。"
                : player.storyUrl
                  ? "命主故事已入账，命格卡右下角可扫码。"
                  : "故事若入雾，主流程照走。"}
            </p>
            {player.storyUrl ? (
              <a className="ghost-button story-link-button" href={player.storyUrl} target="_blank" rel="noreferrer">
                读命主故事
              </a>
            ) : null}
            <StoryLedger beats={player.storyBeats} />
          </aside>
        </section>
      );
    }

    return (
      <section className="leaving-screen">
        <p>{player.endingLine ?? "明日还有明日的事。"}</p>
        <button className="ghost-button" type="button" onClick={resetGame}>
          再入一回
        </button>
      </section>
    );
  }

  return (
    <main className={player ? "app-shell" : "app-shell intro-mode"}>
      <header className="topbar">
        <span>罗刹当铺</span>
        <div className="topbar-actions">
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
          <a href="/showcase" target="_blank" rel="noreferrer">
            展示图
          </a>
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="screen-transition"
          exit={{ opacity: 0, y: -14, filter: "blur(5px)" }}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          key={screenKey}
          transition={{ duration: 0.34, ease: "easeOut" }}
        >
          {renderMain()}
        </motion.div>
      </AnimatePresence>
      <TransitionVeil stamp={veil?.stamp ?? "none"} text={veil?.text} />
      <ShopkeeperDialog text={activeDialog} onDone={() => setActiveDialog(undefined)} />
      <ItemObtainOverlay
        after={obtained?.after}
        before={obtained?.before}
        item={obtained?.item}
        onDone={() => setObtained(undefined)}
      />
    </main>
  );
}

function transitionText(screenKey: string): string | undefined {
  const labels: Record<string, string> = {
    entering: "雾门一开",
    question: "掌柜问来意",
    ritual: "签筒自响",
    fateLoading: "命数入纸",
    fateCard: "命牌落案",
    pawnRequired: "柜门半启",
    shop: "货架亮灯",
    lotOffer: "又添一签",
    receipt: "当票成书",
    leaving: "天色将白"
  };
  return labels[screenKey];
}
