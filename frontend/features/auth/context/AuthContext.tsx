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

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await fetch("/api/v1/auth/session", { cache: "no-store" });
        if (response.ok) setUser((await readJson(response)).user ?? null);
      } finally {
        setReady(true);
      }
    }
    void restoreSession();
  }, []);

  async function register(account: RegisterAccount) {
    const response = await fetch("/api/v1/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(account) });
    setUser((await readJson(response)).user ?? null);
  }

  async function login(email: string, password: string, rememberMe = false) {
    const response = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, rememberMe }) });
    const signedInUser = (await readJson(response)).user;
    if (!signedInUser) throw new Error("Could not start a user session.");
    setUser(signedInUser);
    return signedInUser;
  }

  async function logout() {
    try { await fetch("/api/v1/auth/logout", { method: "POST" }); }
    finally { setUser(null); }
  }

  return <AuthContext.Provider value={{ user, ready, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
