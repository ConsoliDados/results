import type { Result as ResultType } from "@/result";

type Result<T> = ResultType<T, Error>;

describe("Custom Result test suite", () => {
  it("should create an Ok result using a custom result type with only success type definition and access its value", () => {
    const result: Result<number> = Ok(42);

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(42);
  });

  it("should create an Err result using a custom result type with any type", () => {
    const result: Result<unknown> = Err("Error occurred");
    // The line below will lead to a compilation error:
    // const result: Result<never> = "Error occurred";

    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(result.unwrapErr().message).toBe("Error occurred");
  });

  it("should create an Error type Err result using a custom result type with any type", () => {
    // const result: Result<unknown> = Err(new Error("Error occurred"));
    const result: Result<unknown> = Err("Error occurred");
    // The line below will lead to a compilation error:
    // const result: Result<never> = "Error occurred";

    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect(result.unwrapErr().message).toBe("Error occurred");
  });
  // TODO: create a test for custom errors
});
