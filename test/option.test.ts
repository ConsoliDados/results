import type { Option } from "@/option";

describe("Option", () => {
  it("should create a Some option and access its value", () => {
    const option: Option<number> = Some(42);

    expect(option.isSome()).toBe(true);
    expect(option.isNone()).toBe(false);
    expect(option.unwrap()).toBe(42);
  });

  it("should create a None option", () => {
    const option: Option<number> = None();

    expect(option.isSome()).toBe(false);
    expect(option.isNone()).toBe(true);
    expect(() => option.unwrap()).toThrow("Called unwrap on a None value");
  });

  it("should map over a Some option", () => {
    const option: Option<number> = Some(10);
    const mapped = option.map((value) => value * 2);

    expect(mapped.isSome()).toBe(true);
    expect(mapped.unwrap()).toBe(20);
  });

  it("should not map over a None option", () => {
    const option: Option<number> = None();
    const mapped = option.map((value) => value * 2);

    expect(mapped.isNone()).toBe(true);
    expect(() => mapped.unwrap()).toThrow("Called unwrap on a None value");
  });

  it("should flatMap over a Some option", () => {
    const option: Option<number> = Some(10);
    const flatMapped = option.flatMap((value) => Some(value * 3));

    expect(flatMapped.isSome()).toBe(true);
    expect(flatMapped.unwrap()).toBe(30);
  });

  it("should not flatMap over a None option", () => {
    const option: Option<number> = None();
    const flatMapped = option.flatMap((value) => Some(value * 3));

    expect(flatMapped.isNone()).toBe(true);
  });

  it("should return a default value with unwrapOr on a Some option", () => {
    const option: Option<number> = Some(10);
    expect(option.unwrapOr(42)).toBe(10);
  });

  it("should return a default value with unwrapOr on a None option", () => {
    const option: Option<number> = None();
    expect(option.unwrapOr(42)).toBe(42);
  });

  describe("value() method", () => {
    it("should return the value from Some using value()", () => {
      const option: Option<number> = Some(42);

      expect(option.isSome()).toBe(true);
      expect(option.value()).toBe(42);
    });

    it("should return undefined from None using value()", () => {
      const option: Option<number> = None();

      expect(option.isNone()).toBe(true);
      expect(option.value()).toBe(undefined);
    });

    it("should work with type narrowing after isSome()", () => {
      const option: Option<string> = Some("hello");

      if (option.isSome()) {
        // After type guard, value() returns string
        const value = option.value();
        expect(value).toBe("hello");
        expect(typeof value).toBe("string");
      }
    });

    it("should work with type narrowing after isNone()", () => {
      const option: Option<number> = None();

      if (option.isNone()) {
        // After type guard, value() returns undefined
        const value = option.value();
        expect(value).toBe(undefined);
      }
    });

    it("should support early return pattern with value()", () => {
      function processOption(option: Option<number>): number {
        if (option.isNone()) {
          return 0; // default value
        }
        // value is number here
        return option.value() * 2;
      }

      expect(processOption(Some(10))).toBe(20);
      expect(processOption(None())).toBe(0);
    });

    it("should not throw error when calling value() on None (unlike unwrap)", () => {
      const option: Option<number> = None();

      // unwrap() throws
      expect(() => option.unwrap()).toThrow("Called unwrap on a None value");

      // value() returns undefined (does not throw)
      expect(option.value()).toBe(undefined);
    });
  });
});
