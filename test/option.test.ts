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
});
