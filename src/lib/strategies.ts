export type PlanningStrategy = "fibonacci" | "tshirt";

type StrategyConfig = {
  label: string;
  values: string[];
  description: string;
};

export const STRATEGIES: Record<PlanningStrategy, StrategyConfig> = {
  fibonacci: {
    label: "Fibonacci",
    values: ["0", "1", "2", "3", "5", "8", "13", "21", "?"],
    description: "Classic Fibonacci sequence often used for effort sizing.",
  },
  tshirt: {
    label: "T-Shirt Sizes",
    values: ["XS", "S", "M", "L", "XL", "XXL", "?"],
    description: "Simple sizing using T-shirt sizes for rough estimates.",
  },
};

export const DEFAULT_STRATEGY: PlanningStrategy = "fibonacci";

export function isPlanningStrategy(value: string): value is PlanningStrategy {
  return value === "fibonacci" || value === "tshirt";
}
