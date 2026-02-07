describe("Result new features", () => {
  it("unwrapOr should return value for Ok", () => {
    const result = Ok(42);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it("unwrapOr should return default for Err", () => {
    const result = Err("error");
    expect(result.unwrapOr(0)).toBe(0);
  });

  it("unwrapOrElse should return value for Ok", () => {
    const result = Ok(42);
    expect(result.unwrapOrElse(() => 0)).toBe(42);
  });

  it("unwrapOrElse should compute default for Err", () => {
    const result = Err("error");
    const unwrapped = result.unwrapOrElse((e) => `fallback: ${e}`);
    expect(unwrapped).toContain("fallback:");
    expect(unwrapped).toContain("error");
  });

  it("orElse should return Ok unchanged", () => {
    const result = Ok(42);
    const alternative = result.orElse(() => Ok(0));
    expect(alternative.isOk()).toBe(true);
    expect(alternative.unwrap()).toBe(42);
  });

  it("orElse should compute alternative for Err", () => {
    const result = Err("error");
    const alternative = result.orElse(() => Ok(999));
    expect(alternative.isOk()).toBe(true);
    expect(alternative.unwrap()).toBe(999);
  });
});

describe("Option new features", () => {
  it("unwrapOrElse should return value for Some", () => {
    const option = Some(42);
    expect(option.unwrapOrElse(() => 0)).toBe(42);
  });

  it("unwrapOrElse should compute default for None", () => {
    const option = None();
    expect(option.unwrapOrElse(() => 0)).toBe(0);
  });

  it("okOr should return Ok for Some", () => {
    const option = Some(42);
    const result = option.okOr("error");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it("okOr should return Err for None", () => {
    const option = None();
    const result = option.okOr("error");
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    expect(err).toBe("error");
  });

  it("filter should return Some if predicate is true", () => {
    const option = Some(42);
    const filtered = option.filter((x) => x > 40);
    expect(filtered.isSome()).toBe(true);
    expect(filtered.unwrap()).toBe(42);
  });

  it("filter should return None if predicate is false", () => {
    const option = Some(42);
    const filtered = option.filter((x) => x > 50);
    expect(filtered.isNone()).toBe(true);
  });

  it("filter should return None for None", () => {
    const option = None();
    const filtered = option.filter((_) => true);
    expect(filtered.isNone()).toBe(true);
  });
});

describe("Match with primitives", () => {
  enum Status {
    Active = "active",
    Inactive = "inactive",
    Pending = "pending",
  }

  it("should match enum with exhaustive cases", () => {
    function getStatus(): Status {
      return Status.Active;
    }
    const status = getStatus();
    const result = match(status, {
      [Status.Active]: () => "User is active",
      [Status.Inactive]: () => "User is inactive",
      [Status.Pending]: () => "User is pending",
    });
    match(status, {
      [Status.Active]: () => "User is active",
      [Status.Inactive]: () => "User is inactive",
      [Status.Pending]: () => "User is pending",
    });
    expect(result).toBe("User is active");
  });

  it("should match enum with default case", () => {
    const status = Status.Active;
    const result = match(status, {
      [Status.Active]: () => "User is active",
      default: () => "Unknown status",
    });
    expect(result).toBe("User is active");
  });

  it("should use default case for unmatched values", () => {
    const status = Status.Pending as Status;
    const result = match(status, {
      [Status.Active]: () => "User is active",
      default: () => "Unknown status",
    });
    expect(result).toBe("Unknown status");
  });
});

describe("Match with discriminated unions", () => {
  type Shape =
    | { type: "circle"; radius: number }
    | { type: "rectangle"; width: number; height: number }
    | { type: "triangle"; base: number; height: number };

  it("should match discriminated unions with exhaustive cases", () => {
    const circle = { type: "circle", radius: 10 } as Shape;
    const result = match(
      circle,
      {
        circle: (shape) => Math.PI * shape.radius ** 2,
        rectangle: (shape) => shape.width * shape.height,
        triangle: (shape) => (shape.base * shape.height) / 2,
      },
      "type",
    );
    expect(result).toBeCloseTo(314.159, 2);
  });

  it("should match discriminated unions with default case", () => {
    const rectangle = { type: "rectangle", width: 5, height: 10 } as Shape;
    const result = match(
      rectangle,
      {
        circle: (shape) => Math.PI * shape.radius ** 2,
        default: () => 0,
      },
      "type",
    );
    expect(result).toBe(0);
  });
});

describe("match Object", () => {
  const Status = {
    Active: "active",
    Inactive: "inactive",
    Pending: "pending",
  } as const;
  type Status = (typeof Status)[keyof typeof Status];

  it("should match Object with exaustive cases case", () => {
    function getStatus(): Status {
      return Status.Active;
    }

    const status = getStatus();
    const result = match(status, {
      [Status.Active]: () => "User is active",
      [Status.Inactive]: () => "User is inactive",
      [Status.Pending]: () => "User is pending",
    });
    match(status, {
      active: () => "User is active",
      inactive: () => "User is inactive",
      pending: () => "User is pending",
    });
    expect(result).toBe("User is active");
  });
  it("should match Object with default  case", () => {
    function getStatus(): Status {
      return Status.Active;
    }

    const status = getStatus();
    const result = match(status, {
      [Status.Active]: () => "User is active",
      default: () => "Unknown status",
    });
    expect(result).toBe("User is active");
  });
});
