import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: "ADMIN",
  DIRECTOR_REGIONAL: "DIRECTOR_REGIONAL",
  ASESOR: "ASESOR",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica sesión activa al cargar la aplicación contra GET /auth/me
  const checkSession = useCallback(async () => {
    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async ({ email, password, rememberMe }) => {
    await authService.login({ email, password, rememberMe });
    // Tras autenticarse, consultamos GET /auth/me para obtener el rol y zona exactos
    const meData = await authService.getMe();
    setUser(meData.user);
    return meData.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    role: user?.role ?? null,
    zoneId: user?.zoneId ?? null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    loginWithMicrosoft: authService.loginWithMicrosoft,
    checkSession,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return ctx;
}
