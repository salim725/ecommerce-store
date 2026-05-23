import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats an ISO date string in en-US short month style", () => {
    expect(formatDate("2024-03-15T12:00:00.000Z")).toMatch(/Mar 15, 2024/);
  });

  it("handles midnight UTC without shifting the calendar day in en-US", () => {
    expect(formatDate("2024-01-01T00:00:00.000Z")).toMatch(/Jan 1, 2024/);
  });
});
