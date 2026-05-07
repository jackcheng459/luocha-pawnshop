import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DoorOpen, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CrisisFallback } from "./components/CrisisFallback";
import { DoorTransition } from "./components/DoorTransition";
import { EntryQuestion } from "./components/EntryQuestion";
import { FateCard } from "./components/FateCard";
import { FateRitual } from "./components/FateRitual";
import { GuidanceChoice } from "./components/GuidanceChoice";
import { ItemShelf } from "./components/ItemShelf";
import { ItemObtainOverlay } from "./components/ItemObtainOverlay";
import { LotDrawer } from "./components/LotDrawer";
import { LotResultPanel } from "./components/LotResultPanel";
import { OpeningScene } from "./components/OpeningScene";
import { PawnForm } from "./components/PawnForm";
import { PhraseAdmin } from "./components/PhraseAdmin";
import { ReceiptAssemble } from "./components/ReceiptAssemble";
import { ResourceLedger } from "./components/ResourceLedger";
import { SceneImage } from "./components/SceneImage";
import { ShopScene } from "./components/ShopScene";
import { ShopkeeperDialog } from "./components/ShopkeeperDialog";
import { ShowcasePoster } from "./components/ShowcasePoster";
import { SoundToggle } from "./components/SoundToggle";
import { StoryPage } from "./components/StoryPage";
import { StoryLedger } from "./components/StoryLedger";
import { TransitionVeil } from "./components/TransitionVeil";
import { FateReceiptExportButton } from "./components/export/FateReceiptExportButton";
import { StoryCardExportButton } from "./components/export/StoryCardExportButton";
import { YezhangModal } from "./components/yezhang/YezhangModal";
import { resourceLabels, resourceOrder } from "./data/fates";
import { items } from "./data/items";
import type { EntryIntent, GuidanceMode, Item, PawnInput, ResourceMap } from "./data/types";
import { checkSafety } from "./game/compliance";
import { fallbackFate } from "./game/fate";
import { gameReducer, initialState } from "./game/reducer";
import {
  applyPrice,
  applySideEffects,
  canAfford,
  drawLot,
  generateInitialResources,
  scaledPrice
} from "./game/rules";
import { fallbackPawnResult, fallbackReceiptResult } from "./services/fallback";
import { requestFate, requestPawn, requestReceipt } from "./services/llmClient";
import { audioEngine } from "./services/audioEngine";
import { createFateStory } from "./services/storyClient";
import { capturePawnContribution } from "./services/contributionClient";
import { clearYezhang, loadYezhang, saveStoryToYezhang } from "./services/yezhang";

const GUIDANCE_NODES = {
  PAWN_FIRST_TIME: "pawn_first_time",
  SHELF_FIRST_TIME: "shelf_first_time"
} as const;

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
  const [guidanceMode, setGuidanceMode] = useState<GuidanceMode | null>(null);
  const [insufficientItemId, setInsufficientItemId] = useState<number | undefined>();
  const [obtained, setObtained] = useState<
    { item: Item; before: ResourceMap; after: ResourceMap } | undefined
  >();
  const fateRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const ritualDoneRef = useRef(false);
  const fateRequestRef = useRef(0);
  const shownGuidanceRef = useRef<Set<string>>(new Set());
  const shownInsufficientItemRef = useRef<Set<number>>(new Set());
  const lastPhaseRef = useRef(state.phase);
  const [veil, setVeil] = useState<{ stamp: string; text: string }>();
  const [yezhangOpen, setYezhangOpen] = useState(false);
  const [yezhangConfirmingClear, setYezhangConfirmingClear] = useState(false);
  const [yezhangVersion, setYezhangVersion] = useState(0);
  const player = state.player;
  const screenKey = player ? state.phase : introStage;
  const yezhangRecords = useMemo(() => loadYezhang().records, [yezhangVersion]);

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
      saveStoryToYezhang(record);
      setYezhangVersion((version) => version + 1);
      dispatch({ type: "SET_STORY_RESULT", story: record, storyQrUrl, storyUrl, usedFallback });
    });
  }, [player, state.phase]);

  useEffect(() => {
    try {
      if (player?.drewLot) {
        window.sessionStorage.setItem(
          "luocha:lot",
          JSON.stringify({
            result: player.lotResult,
            mode: player.lotMode,
            entry: player.lotEntry
          })
        );
      } else {
        window.sessionStorage.removeItem("luocha:lot");
      }
    } catch {
      // 抽签状态只服务本局流程，sessionStorage 不可用时不影响主流程。
    }
  }, [player?.drewLot, player?.lotEntry, player?.lotMode, player?.lotResult]);

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
    const requestId = fateRequestRef.current + 1;
    fateRequestRef.current = requestId;
    audioEngine.playSeal();
    setIntroStage("fateLoading");
    const resources = generateInitialResources();
    const fate = await requestFate(resources, entryIntent);
    if (requestId !== fateRequestRef.current) return;
    dispatch({ type: "START_WITH_FATE", entryIntent, resources, fate, llmLoading: false });
  }

  function changeFate() {
    audioEngine.playSeal();
    const resources = generateInitialResources();
    const fate = fallbackFate(resources);
    dispatch({ type: "CHANGE_FATE", resources, fate });
  }

  function chooseGuidanceMode(mode: GuidanceMode) {
    setGuidanceMode(mode);
    dispatch({ type: "GO_PAWN" });
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
    fateRequestRef.current += 1;
    shownGuidanceRef.current.clear();
    shownInsufficientItemRef.current.clear();
    ritualDoneRef.current = false;
    setIntroStage("opening");
    setEntryIntent("relief");
    setGuidanceMode(null);
    setInsufficientItemId(undefined);
    setShowPawnAgain(false);
    setActiveDialog(undefined);
    setObtained(undefined);
    dispatch({ type: "RESET" });
    clearLotSession();
  }

  function handleBuy(itemId: number) {
    if (!player) return;
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    if (!canAfford(player.resources, item.price, player.priceMultiplier)) {
      audioEngine.playDeny();
      if (guidanceMode === "novice" && !shownInsufficientItemRef.current.has(itemId)) {
        shownInsufficientItemRef.current.add(itemId);
        setInsufficientItemId(itemId);
      } else {
        setInsufficientItemId(undefined);
      }
      dispatch({ type: "BUY_ITEM", itemId });
      return;
    }
    setInsufficientItemId(undefined);
    const before = player.resources;
    const afterPrice = applyPrice(before, item.price, player.priceMultiplier);
    const after = applySideEffects(afterPrice, item.sideEffects);
    audioEngine.playCoin();
    dispatch({ type: "BUY_ITEM", itemId });
    setObtained({ item, before, after });
  }

  function markGuidanceShown(nodeId: string) {
    shownGuidanceRef.current.add(nodeId);
  }

  function canShowGuidance(nodeId: string) {
    return guidanceMode === "novice" && !shownGuidanceRef.current.has(nodeId);
  }

  function insufficientHint(itemId: number): string | undefined {
    if (!player || guidanceMode !== "novice") return undefined;
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return undefined;
    const price = scaledPrice(item, player.priceMultiplier);
    const missing = resourceOrder
      .map((key) => ({ key, value: (price[key] ?? 0) - player.resources[key] }))
      .find((entry) => entry.value > 0);
    if (!missing) return undefined;
    return `客官${resourceLabels[missing.key]}尚缺 ${missing.value} 钱`;
  }

  function canPawnExtra() {
    if (!player) return false;
    return resourceOrder.some((key) => player.resources[key] >= 3);
  }

  function canBuyExtra(multiplier = player?.priceMultiplier ?? 1) {
    if (!player) return false;
    return items.some((item) => canAfford(player.resources, item.price, multiplier));
  }

  function finishReceipt() {
    clearLotSession();
    dispatch({ type: "GO_RECEIPT" });
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
        return (
          <OpeningScene
            showYezhang={yezhangRecords.length > 0}
            onEnter={enterShop}
            onOpenYezhang={() => {
              audioEngine.playPaper();
              setYezhangOpen(true);
              setYezhangConfirmingClear(false);
            }}
          />
        );
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
            {guidanceMode ? (
              <div className="action-row center">
                <FateReceiptExportButton label="导出命格卡" player={player} type="fate" />
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
            ) : (
              <GuidanceChoice onChoose={chooseGuidanceMode} />
            )}
          </div>
          <aside className="side-ledger">
            <ResourceLedger resources={player.resources} />
            <p>{guidanceMode ? state.lastDialog : "命格朱砂未干，掌柜正抬眼看客官。"}</p>
            <StoryLedger beats={player.storyBeats} />
          </aside>
        </section>
      );
    }

    if (state.phase === "pawnRequired") {
      return (
        <section className="two-column">
          <PawnForm
            canSellAgain={Boolean(player.lotMode) || player.pawnCount < 3}
            isEntry={!player.hasPawned}
            pawnRate={player.lotMode === "zhongExtra" ? 0.4 : 0.7}
            resources={player.resources}
            showGuidance={
              !player.hasPawned && canShowGuidance(GUIDANCE_NODES.PAWN_FIRST_TIME)
            }
            onGuidanceVisible={() => markGuidanceShown(GUIDANCE_NODES.PAWN_FIRST_TIME)}
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
              {!player.lotMode ? (
                <button className="ghost-button" type="button" onClick={endGame}>
                  <DoorOpen size={15} strokeWidth={1.8} />
                  <span>结当离店</span>
                </button>
              ) : (
                <p className="lot-extra-note">
                  {player.lotMode === "zhongExtra"
                    ? "中签已落，须再做一笔。"
                    : "上签已反悔，客官可重做一笔。"}
                </p>
              )}
              {player.lotExtraChoice !== "buy" ? (
                <button
                  className="ghost-button"
                  disabled={(!player.lotMode && player.pawnCount >= 3) || showPawnAgain || !canPawnExtra()}
                  type="button"
                  onClick={() => {
                    audioEngine.playPaper();
                    setShowPawnAgain(true);
                  }}
                >
                  再典一物
                </button>
              ) : null}
            </div>
            {showPawnAgain ? (
              <PawnForm
                canSellAgain={Boolean(player.lotMode) || player.pawnCount < 3}
                isEntry={false}
                pawnRate={player.lotMode === "zhongExtra" ? 0.4 : 0.7}
                resources={player.resources}
                onCancel={player.lotMode ? undefined : () => setShowPawnAgain(false)}
                onSubmit={submitPawn}
              />
            ) : null}
          </aside>
          <ItemShelf
            getInsufficientHint={insufficientHint}
            insufficientItemId={guidanceMode === "novice" ? insufficientItemId : undefined}
            player={player}
            showGuidance={canShowGuidance(GUIDANCE_NODES.SHELF_FIRST_TIME)}
            onBuy={handleBuy}
            onGuidanceVisible={() => markGuidanceShown(GUIDANCE_NODES.SHELF_FIRST_TIME)}
          />
        </section>
      );
    }

    if (state.phase === "lotOffer") {
      return (
        <LotDrawer
          guidanceMode={guidanceMode}
          onDraw={() => {
            audioEngine.playLot();
            dispatch({ type: "DRAW_LOT", result: drawLot() });
          }}
        />
      );
    }

    if (state.phase === "lotResult" && player.lotResult) {
      return (
        <section className="two-column">
          <LotResultPanel
            canBuyExtra={canBuyExtra(2)}
            canPawnExtra={canPawnExtra()}
            guidanceMode={guidanceMode}
            huiDeducted={player.lotHuiDeducted}
            result={player.lotResult}
            onChooseZhongBuy={() => dispatch({ type: "LOT_ZHONG_CHOOSE", choice: "buy" })}
            onChooseZhongPawn={() => dispatch({ type: "LOT_ZHONG_CHOOSE", choice: "pawn" })}
            onFinish={finishReceipt}
            onKeepShang={() => dispatch({ type: "LOT_SHANG_KEEP" })}
            onUndoNoRedo={() => dispatch({ type: "LOT_SHANG_UNDO_NO_REDO" })}
            onUndoRedo={() => dispatch({ type: "LOT_SHANG_UNDO_REDO" })}
          />
          <aside className="side-ledger">
            <ResourceLedger resources={player.resources} original={player.originalResources} />
            <p>{state.lastDialog}</p>
            <StoryLedger beats={player.storyBeats} />
          </aside>
        </section>
      );
    }

    if (state.phase === "receipt") {
      return (
        <section className="two-column">
          <div className="card-stage">
            <ReceiptAssemble player={player} cardRef={receiptRef} />
            <div className="action-row center">
              <FateReceiptExportButton label="导出当票卡" player={player} type="receipt" />
              <FateReceiptExportButton label="导出命格卡" player={player} type="fate" />
              {player.storyId && player.nightStory ? (
                <StoryCardExportButton
                  label="导出命主故事卡"
                  story={{
                    fateName: player.fateName,
                    fateJudgment: player.fateText,
                    fateDetail: player.fateDetail,
                    storyId: player.storyId,
                    storyText: player.nightStory,
                    generatedAt: Date.now(),
                    llmModel: "receipt-state",
                    promptVersion: "v1.5.2-story-card",
                    initialResources: player.originalResources,
                    finalResources: player.resources,
                    trades: [],
                    drewLot: player.drewLot,
                    lotResult: player.lotResult,
                    timestamp: player.storyTimestamp ?? player.nightLabel,
                    seasonTerm: player.seasonTerm,
                    nightLabel: player.nightLabel
                  }}
                  storyUrl={player.storyQrUrl ?? player.storyUrl}
                />
              ) : null}
              <button
                className="seal-button"
                type="button"
                onClick={() => {
                  audioEngine.playLeave();
                  shownGuidanceRef.current.clear();
                  shownInsufficientItemRef.current.clear();
                  clearLotSession();
                  setGuidanceMode(null);
                  setInsufficientItemId(undefined);
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
      {yezhangOpen ? (
        <YezhangModal
          confirmingClear={yezhangConfirmingClear}
          records={yezhangRecords}
          onAskClear={() => setYezhangConfirmingClear(true)}
          onCancelClear={() => setYezhangConfirmingClear(false)}
          onClose={() => {
            setYezhangOpen(false);
            setYezhangConfirmingClear(false);
          }}
          onConfirmClear={() => {
            clearYezhang();
            setYezhangVersion((version) => version + 1);
            setYezhangConfirmingClear(false);
            setYezhangOpen(false);
          }}
        />
      ) : null}
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

function clearLotSession() {
  try {
    window.sessionStorage.removeItem("luocha:lot");
  } catch {
    // Session storage is only a same-tab lot marker.
  }
}
