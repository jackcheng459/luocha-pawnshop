import { resourceLabels, resourceOrder } from "../data/fates";
import type {
  Item,
  LotResult,
  PawnAmount,
  PawnInput,
  ResourceKey,
  ResourceMap
} from "../data/types";

export const emptyResources: ResourceMap = {
  chi: 0,
  chen: 0,
  tan: 0,
  wang: 0,
  hui: 0
};

export function clampMoney(value: number): number {
  return Math.max(0, Math.min(99, Math.round(value)));
}

export function clampResources(resources: ResourceMap): ResourceMap {
  return resourceOrder.reduce<ResourceMap>(
    (next, key) => ({ ...next, [key]: clampMoney(resources[key]) }),
    { ...emptyResources }
  );
}

export function generateInitialResources(): ResourceMap {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const cuts = Array.from({ length: 4 }, () => randomInt(10, 89)).sort(
      (a, b) => a - b
    );
    const points = [0, ...cuts, 99];
    const values = points.slice(1).map((point, index) => point - points[index]);
    if (values.every((value) => value >= 10)) {
      const shuffledKeys = shuffle(resourceOrder);
      return shuffledKeys.reduce<ResourceMap>(
        (map, key, index) => ({ ...map, [key]: values[index] }),
        { ...emptyResources }
      );
    }
  }

  return { chi: 19, chen: 20, tan: 20, wang: 20, hui: 20 };
}

export function formatMoney(qian: number): string {
  const safe = clampMoney(qian);
  if (safe < 10) return `${safe} 钱`;
  const liang = Math.floor(safe / 10);
  const rest = safe % 10;
  return rest === 0 ? `${liang} 两` : `${liang} 两 ${rest} 钱`;
}

export function formatResourcePrice(price: Partial<ResourceMap>, multiplier = 1): string {
  return resourceOrder
    .filter((key) => price[key])
    .map((key) => `${resourceLabels[key]} ${formatMoney((price[key] ?? 0) * multiplier)}`)
    .join(" + ");
}

export function canAfford(
  resources: ResourceMap,
  price: Partial<ResourceMap>,
  multiplier = 1
): boolean {
  return resourceOrder.every((key) => resources[key] >= (price[key] ?? 0) * multiplier);
}

export function applyPrice(
  resources: ResourceMap,
  price: Partial<ResourceMap>,
  multiplier = 1
): ResourceMap {
  const next = { ...resources };
  resourceOrder.forEach((key) => {
    next[key] = next[key] - (price[key] ?? 0) * multiplier;
  });
  return clampResources(next);
}

export function applySideEffects(
  resources: ResourceMap,
  sideEffects: Partial<ResourceMap>
): ResourceMap {
  const next = { ...resources };
  resourceOrder.forEach((key) => {
    next[key] = next[key] + (sideEffects[key] ?? 0);
  });
  return clampResources(next);
}

export function computePawn(input: PawnInput, current: ResourceMap, rate = 0.7) {
  const resourceTo = getPawnTarget(input);
  const amountFrom = Math.min(input.amountFrom, current[input.resourceFrom]) as PawnAmount;
  const amountTo = Math.floor(amountFrom * rate);
  const resources = { ...current };
  resources[input.resourceFrom] -= amountFrom;
  resources[resourceTo] += amountTo;

  return {
    resourceTo,
    amountFrom,
    amountTo,
    resources: clampResources(resources)
  };
}

export function getPawnTarget(input: PawnInput): ResourceKey {
  if (input.resourceFrom === "hui") return input.resourceTo ?? "chi";
  return "hui";
}

export function scaledPrice(item: Item, multiplier: 1 | 2): Partial<ResourceMap> {
  if (multiplier === 1) return item.price;
  return resourceOrder.reduce<Partial<ResourceMap>>((price, key) => {
    if (item.price[key]) price[key] = (item.price[key] ?? 0) * multiplier;
    return price;
  }, {});
}

export function drawLot(): LotResult {
  const value = Math.random();
  if (value < 0.3) return "shang";
  if (value < 0.8) return "zhong";
  return "xia";
}

export function resourceName(key: ResourceKey): string {
  return resourceLabels[key];
}

export function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createId(prefix: string): string {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
