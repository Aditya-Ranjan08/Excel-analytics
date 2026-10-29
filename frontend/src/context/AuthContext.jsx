/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const clearStoredSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("expiryTime");
  localStorage.removeItem("role");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.setItem("flashToast", JSON.stringify({ type: "success", message: "You are now signed out." }));
    clearStoredSession();
    setUser(null);
    window.location.replace("/");
  }, []);

  const login = useCallback((token) => {
    const decoded = jwtDecode(token);
    const expiryTime = Number(decoded.exp) * 1000;
    if (!decoded.exp || expiryTime <= Date.now()) {
      throw new Error("The login session is invalid or expired. Please sign in again.");
    }

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("expiryTime", String(expiryTime));
    if (decoded.role) localStorage.setItem("role", decoded.role);
    setUser(decoded);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const expiryTime = Number(sessionStorage.getItem("expiryTime"));

    if (token && expiryTime > Date.now()) {
      try {
        const decoded = jwtDecode(token);
        if (!decoded.exp || decoded.exp * 1000 <= Date.now()) throw new Error("Expired token");
        setUser(decoded);
        if (decoded.role) localStorage.setItem("role", decoded.role);
      } catch {
        clearStoredSession();
      }
    } else if (token || sessionStorage.getItem("expiryTime")) {
      clearStoredSession();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const expiryTime = Number(sessionStorage.getItem("expiryTime"));
    const timeout = expiryTime - Date.now();
    if (timeout <= 0) {
      logout();
      return undefined;
    }
    const timer = window.setTimeout(logout, timeout);
    return () => window.clearTimeout(timer);
  }, [user, logout]);

  const contextValue = useMemo(() => ({ user, login, logout, loading }), [user, login, logout, loading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
