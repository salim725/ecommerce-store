import { configureStore } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import authReducer, { login, logout, verify2FA, fetchMe } from "./authSlice";
import * as authApi from "../services/authApi";

jest.mock("../services/authApi");

const adminUser: authApi.AuthUser = {
  id: "1",
  name: "Admin",
  email: "admin@crm.com",
  role: "admin",
};

function createTestStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe("authSlice", () => {
  describe("logout", () => {
    it("clears user, token, pendingEmail, and crm_token from localStorage", () => {
      localStorage.setItem("crm_token", "old-token");
      const state = authReducer(
        {
          user: adminUser,
          token: "old-token",
          pendingEmail: "admin@crm.com",
          isLoading: false,
          error: null,
        },
        logout(),
      );

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.pendingEmail).toBeNull();
      expect(localStorage.getItem("crm_token")).toBeNull();
    });
  });

  describe("login thunk", () => {
    it("sets pendingEmail on success", async () => {
      jest.mocked(authApi.loginAdmin).mockResolvedValue(null);
      const store = createTestStore();

      await store.dispatch(login({ email: "admin@crm.com", password: "secret" }));

      expect(store.getState().auth.pendingEmail).toBe("admin@crm.com");
      expect(store.getState().auth.isLoading).toBe(false);
      expect(store.getState().auth.error).toBeNull();
    });

    it("sets error message when loginAdmin rejects", async () => {
      jest.mocked(authApi.loginAdmin).mockRejectedValue(
        new AxiosError("locked", undefined, undefined, undefined, {
          data: { message: "Account locked" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as never,
        }),
      );
      const store = createTestStore();

      await store.dispatch(login({ email: "bad@crm.com", password: "x" }));

      expect(store.getState().auth.error).toBe("Account locked");
      expect(store.getState().auth.pendingEmail).toBeNull();
    });
  });

  describe("verify2FA thunk", () => {
    it("stores token and user for admin role", async () => {
      jest.mocked(authApi.verifyAdmin2Fa).mockResolvedValue({ token: "jwt-1" });
      jest.mocked(authApi.getMe).mockResolvedValue(adminUser);
      const store = createTestStore();

      await store.dispatch(
        verify2FA({ email: "admin@crm.com", code: "123456" }),
      );

      const { auth } = store.getState();
      expect(auth.token).toBe("jwt-1");
      expect(auth.user).toEqual(adminUser);
      expect(localStorage.getItem("crm_token")).toBe("jwt-1");
    });

    it("rejects non-admin users and removes token from localStorage", async () => {
      jest.mocked(authApi.verifyAdmin2Fa).mockResolvedValue({ token: "jwt-2" });
      jest.mocked(authApi.getMe).mockResolvedValue({
        ...adminUser,
        role: "agent",
      });
      const store = createTestStore();

      await store.dispatch(
        verify2FA({ email: "agent@crm.com", code: "123456" }),
      );

      expect(store.getState().auth.error).toBe("Admin access required");
      expect(store.getState().auth.token).toBeNull();
      expect(localStorage.getItem("crm_token")).toBeNull();
    });
  });

  describe("fetchMe thunk", () => {
    it("clears session when user is not admin", async () => {
      localStorage.setItem("crm_token", "jwt-3");
      jest.mocked(authApi.getMe).mockResolvedValue({
        ...adminUser,
        role: "viewer",
      });
      const store = createTestStore();

      await store.dispatch(fetchMe());

      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
      expect(localStorage.getItem("crm_token")).toBeNull();
    });

    it("rejects when no token is in localStorage", async () => {
      jest.mocked(authApi.getMe).mockResolvedValue(adminUser);
      const store = createTestStore();

      await store.dispatch(fetchMe());

      expect(store.getState().auth.error).toBe("Not authenticated");
    });
  });
});
