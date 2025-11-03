import {
  STRATEGIES,
  DEFAULT_STRATEGY,
  isPlanningStrategy,
  type PlanningStrategy,
} from "../strategies";

describe("strategies", () => {
  describe("STRATEGIES", () => {
    it("should have fibonacci strategy", () => {
      expect(STRATEGIES.fibonacci).toBeDefined();
      expect(STRATEGIES.fibonacci.label).toBe("Fibonacci");
      expect(STRATEGIES.fibonacci.values).toEqual([
        "0",
        "1",
        "2",
        "3",
        "5",
        "8",
        "13",
        "21",
        "?",
      ]);
      expect(STRATEGIES.fibonacci.description).toBeTruthy();
    });

    it("should have tshirt strategy", () => {
      expect(STRATEGIES.tshirt).toBeDefined();
      expect(STRATEGIES.tshirt.label).toBe("T-Shirt Sizes");
      expect(STRATEGIES.tshirt.values).toEqual([
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "?",
      ]);
      expect(STRATEGIES.tshirt.description).toBeTruthy();
    });

    it("should have exactly two strategies", () => {
      expect(Object.keys(STRATEGIES)).toHaveLength(2);
    });
  });

  describe("DEFAULT_STRATEGY", () => {
    it("should be fibonacci", () => {
      expect(DEFAULT_STRATEGY).toBe("fibonacci");
    });

    it("should be a valid strategy", () => {
      expect(STRATEGIES[DEFAULT_STRATEGY]).toBeDefined();
    });
  });

  describe("isPlanningStrategy", () => {
    it("should return true for fibonacci", () => {
      expect(isPlanningStrategy("fibonacci")).toBe(true);
    });

    it("should return true for tshirt", () => {
      expect(isPlanningStrategy("tshirt")).toBe(true);
    });

    it("should return false for invalid strategy", () => {
      expect(isPlanningStrategy("invalid")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isPlanningStrategy("")).toBe(false);
    });

    it("should return false for numbers", () => {
      expect(isPlanningStrategy("123")).toBe(false);
    });
  });
});
