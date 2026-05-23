import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats zero as ILS currency", () => {
    expect(formatPrice(0)).toBe("‏0.00 ‏₪");
  });

  it("formats positive amounts with two decimal places", () => {
    expect(formatPrice(1234.5)).toBe("‏1,234.50 ‏₪");
  });

  it("formats negative amounts", () => {
    expect(formatPrice(-99)).toBe("‏‎-99.00 ‏₪");
  });
});
