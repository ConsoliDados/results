import type { Option } from "@/option";
import type { Result } from "@/result";

describe("Result Test Suite", () => {
  it("should handle Ok case", () => {
    const sut: Result<string, Error> = Ok("Success");

    const result = match(sut, {
      Ok: (value) => `Value: ${value}`,
      Err: (error) => {
        throw new Error(`Error: ${(error as Error).message}`);
      },
    });

    expect(result).toBe("Value: Success");
  });

  it("should handle Err case", () => {
    const sut: Result<string, Error> = Err(new Error("Success"));

    const result = match(sut, {
      Ok: (value) => `Value: ${value}`,
      Err: (_) => "Value: Error",
    });

    expect(result).toBe("Value: Error");
  });
});

describe("Option Test Suite", () => {
  it("should handle Some and None cases", () => {
    const sut: Option<number> = Some(42);

    const result = match(sut, {
      Some: (value) => `Value: ${value}`,
      None: () => "No value",
    });

    expect(result).toBe("Value: 42");
  });

  it("should handle None case", () => {
    const sut: Option<number> = None();

    const result = match(sut, {
      Some: (value) => `Value: ${value}`,
      None: () => "No value",
    });

    match(sut, {
      Some: (_) => 1,
      None: () => 0,
    });

    expect(result).toBe("No value");
  });

  it("should convert Result to Option", () => {
    const sut: Result<string, Error> = Ok("Success");
    const result = match(sut, {
      Ok: (value) => Some(value),
      Err: (_) => None(),
    });

    expect(result.unwrap()).toBe("Success");
  });

  it("should convert Option to Result", () => {
    const sut: Option<string> = Some("Success");
    const result = match(sut, {
      Some: (value) => Ok(value),
      None: () => Err("Some Error"),
    });

    expect(result.unwrap()).toBe("Success");
  });
});
