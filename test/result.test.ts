import type { Result } from "@/result";

describe("Result test suite", () => {
  it("should create an Ok result and access its value", () => {
    const result: Result<number, Error> = Ok(42);

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(42);
  });

  it("should create an Err result and access its error", () => {
    const result: Result<number, Error> = Err("Error occurred");

    expect(result.isOk()).toBe(false);
    expect(result.isErr()).toBe(true);
    expect(() => result.unwrap()).toThrow("Called unwrap on an Err value");
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(result.unwrapErr().message).toBe("Error occurred");
  });

  it("should map over an Ok result", () => {
    const result: Result<number, Error> = Ok(10);
    const mapped = result.map((value) => value * 2);

    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(20);
  });

  it("should not map over an Err result", () => {
    const result: Result<number, Error> = Err("Error occurred");
    const mapped = result.map((value) => value * 2);

    expect(mapped.isErr()).toBe(true);
    expect(() => mapped.unwrap()).toThrow("Called unwrap on an Err value");
  });

  it("should mapErr over an Err result", () => {
    const result: Result<number, Error> = Err("Error occurred");
    const mappedErr = result.mapErr((err) => Error(`Modified: ${err}`));

    expect(mappedErr.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(mappedErr.unwrapErr().message).toBe(
      "Modified: Error: Error occurred",
    );
  });

  it("should flatMap over an Ok result", () => {
    const result: Result<number, Error> = Ok(10);
    const flatMapped = result.flatMap((value) => Ok(value * 3));

    expect(flatMapped.isOk()).toBe(true);
    expect(flatMapped.unwrap()).toBe(30);
  });

  it("should not flatMap over an Err result", () => {
    const result: Result<number, Error> = Err("Error occurred");
    const flatMapped = result.flatMap((value) => Ok(value * 3));

    expect(flatMapped.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(flatMapped.unwrapErr().message).toBe("Error occurred");
  });
});
