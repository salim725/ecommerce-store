// src/__tests__/integration/auth/adminAuthFlow.test.ts
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "@/src/shared/services/axiosInstance";
import { login, verify2FA } from "@/src/features/auth/slices/authSlice";
import { makeStore } from "@/src/__tests__/utils/testStore";
import { successEnvelope, errorEnvelope } from "@/src/__tests__/utils/apiHelpers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api/v1";

const adminUser = {
  id: "u1",
  name: "Admin",
  email: "admin@crm.com",
  role: "admin",
};

describe("Auth — admin login + 2FA (axios integration)", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
  });

  it("login.fulfilled sets pendingEmail after admin login POST succeeds", async () => {
    mock
      .onPost(`${API_BASE}/auth/admin/login`)
      .reply(200, successEnvelope(null, "2FA code sent to your email"));

    const store = makeStore();
    await store.dispatch(
      login({ email: "admin@crm.com", password: "secret" }),
    );

    const { auth } = store.getState();
    expect(auth.pendingEmail).toBe("admin@crm.com");
    expect(auth.error).toBeNull();
    expect(auth.isLoading).toBe(false);
  });

  it("login.rejected maps API message from envelope", async () => {
    mock
      .onPost(`${API_BASE}/auth/admin/login`)
      .reply(401, errorEnvelope("Invalid credentials", 401));

    const store = makeStore();
    await store.dispatch(
      login({ email: "bad@crm.com", password: "wrong" }),
    );

    expect(store.getState().auth.error).toBe("Invalid credentials");
    expect(store.getState().auth.pendingEmail).toBeNull();
  });

  it("verify2FA.fulfilled stores jwt and admin user via real authApi chain", async () => {
    mock
      .onPost(`${API_BASE}/auth/admin/verify-2fa`)
      .reply(200, successEnvelope({ token: "jwt-admin" }, "Admin login successful"));
    mock
      .onGet(`${API_BASE}/auth/me`)
      .reply(200, successEnvelope(adminUser, "User fetched successfully"));

    const store = makeStore();
    await store.dispatch(
      verify2FA({ email: "admin@crm.com", code: "123456" }),
    );

    const { auth } = store.getState();
    expect(auth.token).toBe("jwt-admin");
    expect(auth.user).toEqual(adminUser);
    expect(localStorage.getItem("crm_token")).toBe("jwt-admin");
  });

  it("verify2FA.rejected clears token when /auth/me returns non-admin role", async () => {
    mock
      .onPost(`${API_BASE}/auth/admin/verify-2fa`)
      .reply(200, successEnvelope({ token: "jwt-agent" }));
    mock.onGet(`${API_BASE}/auth/me`).reply(
      200,
      successEnvelope({ ...adminUser, role: "agent" }),
    );

    const store = makeStore();
    await store.dispatch(
      verify2FA({ email: "agent@crm.com", code: "123456" }),
    );

    expect(store.getState().auth.error).toBe("Admin access required");
    expect(store.getState().auth.token).toBeNull();
    expect(localStorage.getItem("crm_token")).toBeNull();
  });
});
