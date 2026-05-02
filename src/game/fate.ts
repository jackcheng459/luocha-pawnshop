import {
  balancedFates,
  doubleFates,
  extremeFates,
  resourceOrder,
  singleFates
} from "../data/fates";
import { getFateStory } from "../data/fateStories";
import type { FateName, FateResult, ResourceKey, ResourceMap } from "../data/types";
import { pickOne } from "./rules";

export function fallbackFate(resources: ResourceMap): FateResult {
  const fate = selectFate(resources);
  const fateStory = getFateStory(fate.name);
  return {
    name: fate.name,
    text: pickOne(fate.judgments),
    detail: buildFateDetail(fate, resources),
    story: fateStory.story,
    hook: fateStory.hook,
    source: "fallback"
  };
}

export function selectFate(resources: ResourceMap): FateName {
  const entries = resourceOrder
    .map((key) => ({ key, value: resources[key] }))
    .sort((a, b) => b.value - a.value);
  const values = entries.map((entry) => entry.value);
  const max = entries[0];
  const second = entries[1];
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const otherValues = values.filter((value) => value !== max.value);

  if (max.value > 50 && Math.max(...otherValues) < 10) {
    return extremeFates[max.key];
  }

  if (stdDev < 5) {
    return pickOne(balancedFates);
  }

  if (max.value - second.value > 10) {
    return pickOne(singleFates[max.key]);
  }

  return findDoubleFate(max.key, second.key);
}

function findDoubleFate(first: ResourceKey, second: ResourceKey): FateName {
  return (
    doubleFates.find(
      (fate) =>
        (fate.primary === first && fate.secondary === second) ||
        (fate.primary === second && fate.secondary === first)
    ) ?? pickOne(balancedFates)
  );
}

function buildFateDetail(fate: FateName, resources: ResourceMap): string {
  const dominant =
    fate.primary ??
    resourceOrder
      .map((key) => ({ key, value: resources[key] }))
      .sort((a, b) => b.value - a.value)[0].key;

  if (fate.category === "balanced") {
    return pickOne([
      "五味皆有，便不算薄命；只是样样都懂的人，最难替自己选边。",
      "你不是无事，只是把每一件事都压到刚好还能笑出来。",
      "账面平，心里未必平。今夜当掉哪一笔，全看你先疼哪一处。"
    ]);
  }

  if (fate.category === "double" && fate.secondary) {
    return pickOne([
      `${resourceLabel(dominant)}与${resourceLabel(fate.secondary)}相缠，一边舍不得，一边不肯输，所以人间才显得处处要价。`,
      `此命不怕苦，怕的是明明看懂了，还要替旧事留一盏灯。`,
      `两股命数互相牵扯，走得慢不是无能，是你总想把昨日也一起带走。`
    ]);
  }

  const detailByResource: Record<ResourceKey, string[]> = {
    chi: [
      "痴重的人，心里常有一间旧屋。门没锁，只是你每夜都回去。",
      "你最会记得，也最会把记得说成无所谓。掌柜看账，只看你还替谁留灯。"
    ],
    chen: [
      "嗔重的人，表面最稳，心里常有一场没散的官司。",
      "你不是脾气大，是那句凭什么一直没有地方落款。"
    ],
    tan: [
      "贪重的人未必贪财，多半只是还想证明自己值得更多。",
      "你追的不是远方，是那个终于不用解释的自己。"
    ],
    wang: [
      "惘重的人不是没有路，是每条路都像要替过去交代。",
      "雾不全在眼前，也在心里。你问方向，其实是在问能不能重来。"
    ],
    hui: [
      "慧重的人看得太清，清到热闹近身也像隔着水。",
      "你不是放下了全部，只是学会不让别人看见哪一处还亮着。"
    ]
  };

  return pickOne(detailByResource[dominant]);
}

function resourceLabel(key: ResourceKey): string {
  const labels: Record<ResourceKey, string> = {
    chi: "痴",
    chen: "嗔",
    tan: "贪",
    wang: "惘",
    hui: "慧"
  };
  return labels[key];
}
