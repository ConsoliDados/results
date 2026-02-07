import type { Result } from "@/result";

describe("Result test suite", () => {
  it("should create an Ok result and access its value", () => {
    const result: Result<number, string> = Ok(42);

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(42);
  });

  it("should create an Err result and access its error", () => {
    const result: Result<number, string> = Err("Error occurred");

    expect(result.isOk()).toBe(false);
    expect(result.isErr()).toBe(true);
    expect(() => result.unwrap()).toThrow("Called unwrap on an Err value");
    expect(result.unwrapErr()).toBe("Error occurred");
  });

  it("should map over an Ok result", () => {
    const result: Result<number, string> = Ok(10);
    const mapped = result.map((value) => value * 2);

    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(20);
  });

  it("should not map over an Err result", () => {
    const result: Result<number, string> = Err("Error occurred");
    const mapped = result.map((value) => value * 2);

    expect(mapped.isErr()).toBe(true);
    expect(() => mapped.unwrap()).toThrow("Called unwrap on an Err value");
  });

  it("should mapErr over an Err result", () => {
    const result: Result<number, string> = Err("Error occurred");
    const mappedErr = result.mapErr((err) => `Modified: ${err}`);

    expect(mappedErr.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe("Error occurred");
    expect(mappedErr.unwrapErr()).toBe("Modified: Error occurred");
  });

  it("should flatMap over an Ok result", () => {
    const result: Result<number, string> = Ok(10);
    const flatMapped = result.flatMap((value) => Ok(value * 3));

    expect(flatMapped.isOk()).toBe(true);
    expect(flatMapped.unwrap()).toBe(30);
  });

  it("should not flatMap over an Err result", () => {
    const result: Result<number, string> = Err("Error occurred");
    const flatMapped = result.flatMap((value) => Ok(value * 3));

    expect(flatMapped.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe("Error occurred");
    expect(flatMapped.unwrapErr()).toBe("Error occurred");
  });

  describe("value() method", () => {
    it("should return the value from Ok using value()", () => {
      const result: Result<number, string> = Ok(42);

      expect(result.isOk()).toBe(true);
      expect(result.value()).toBe(42);
    });

    it("should return the error from Err using value()", () => {
      const result: Result<number, string> = Err("Error occurred");

      expect(result.isErr()).toBe(true);
      const error = result.value();
      expect(error).toBe("Error occurred");
    });

    it("should work with type narrowing after isOk()", () => {
      const result: Result<number, string> = Ok(100);

      if (result.isOk()) {
        // After type guard, value() returns number
        const value = result.value();
        expect(value).toBe(100);
        expect(typeof value).toBe("number");
      }
    });

    it("should work with type narrowing after isErr()", () => {
      const result: Result<string, string> = Err("Failed operation");

      if (result.isErr()) {
        // After type guard, value() returns string
        const error = result.value();
        expect(error).toBe("Failed operation");
      }
    });

    it("should support early return pattern with value()", () => {
      function processResult(result: Result<number, string>): Result<number, string> {
        if (result.isErr()) {
          return Err(result.value()); // value is string
        }
        // value is number here
        return Ok(result.value() * 2);
      }

      expect(processResult(Ok(10)).unwrap()).toBe(20);
      expect(processResult(Err("Error")).unwrapErr()).toBe("Error");
    });
  });
});
