// src/__tests__/integration/axios/interceptors.test.ts
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "@/src/shared/services/axiosInstance";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api/v1";

describe("axiosInstance interceptors", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
  });

  it("injects Bearer crm_token on outgoing requests", async () => {
    localStorage.setItem("crm_token", "jwt-test");
    mock.onGet(`${API_BASE}/auth/me`).reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer jwt-test");
      return [
        200,
        {
          status: 200,
          message: "OK",
          data: { id: "1", name: "Admin", email: "a@crm.com", role: "admin" },
        },
      ];
    });

    const res = await axiosInstance.get("auth/me");
    expect(res.data.data.role).toBe("admin");
  });

  it("clears crm_token on 401 (redirect to /login is set in interceptor)", async () => {
    localStorage.setItem("crm_token", "expired-jwt");

    mock.onGet(`${API_BASE}/auth/me`).reply(401, {
      status: 401,
      message: "Unauthorized",
      data: null,
    });

    await expect(axiosInstance.get("auth/me")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(localStorage.getItem("crm_token")).toBeNull();
  });
});
