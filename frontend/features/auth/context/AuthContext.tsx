"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthUser = { id: string; name: string; email: string; role: "CUSTOMER" | "MERCHANT" | "ADMIN" };
type RegisterAccount = { name: string; email: string; password: string; rememberMe?: boolean };
type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  register: (account: RegisterAccount) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  startGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readJson(response: Response) {
  const body = (await response.json().catch(() => ({}))) as { message?: string; user?: AuthUser };
  if (!response.ok) throw new Error(body.message ?? "The request could not be completed.");
  return body;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [guestConversionError, setGuestConversionError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function restoreSession() {
      try {
        const response = await fetch("/api/v1/auth/session", { cache: "no-store", signal: controller.signal });
        if (response.ok) {
          const body = await readJson(response);
          if (!controller.signal.aborted) setUser(body.user ?? null);
        }
      } catch {
        // Keep sign-in available when session restoration fails or is aborted.
      } finally {
        if (!controller.signal.aborted) setReady(true);
      }
    }
    void restoreSession();
    return () => controller.abort();
  }, []);

  async function register(account: RegisterAccount) {
    const response = await fetch("/api/v1/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(account) });
    const registeredUser = (await readJson(response)).user;
    if (!registeredUser) throw new Error("Could not start a user session.");
    setUser(registeredUser);
    await convertGuest();
  }

  async function login(email: string, password: string, rememberMe = false) {
    const response = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, rememberMe }) });
    const signedInUser = (await readJson(response)).user;
    if (!signedInUser) throw new Error("Could not start a user session.");
    setUser(signedInUser);
    await convertGuest();
    return signedInUser;
  }

  async function logout() {
    await readJson(await fetch("/api/v1/auth/logout", { method: "POST" }));
    setUser(null);
    setGuestConversionError("");
  }

  async function startGuest() {
    await readJson(await fetch("/api/v1/auth/guest", { method: "POST" }));
  }

  async function convertGuest() {
    try {
      await readJson(await fetch("/api/v1/auth/guest/convert", { method: "POST" }));
      setGuestConversionError("");
    } catch {
      // Account authentication succeeded independently; retain guest data for retry.
      setGuestConversionError("Signed in, but guest data could not be transferred.");
    }
  }

  async function refresh() {
    const response = await fetch("/api/v1/auth/refresh", { method: "POST" });
    if (response.status === 401) setUser(null);
    // A competing tab may have just installed the winning token.
    if (response.status === 409) return;
    const refreshedUser = (await readJson(response)).user;
    if (!refreshedUser) throw new Error("Could not refresh the user session.");
    setUser(refreshedUser);
  }

  return (
    <AuthContext.Provider value={{ user, ready, register, login, logout, refresh, startGuest }}>
      {user && guestConversionError && (
        <div role="alert" className="bg-amber-100 p-3 text-black">
          {guestConversionError}{" "}
          <button type="button" className="underline" onClick={() => void convertGuest()}>Retry transfer</button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
