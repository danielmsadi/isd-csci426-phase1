import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { createEmptyPortal, normalizePortal } from "./emptyPortal";
import { api } from "./api";
const Context = createContext();
export function PortalProvider({ children }) {
  const [db, setDb] = useState(createEmptyPortal);
  const [status, setStatus] = useState(
    api.configured ? "loading" : "disconnected",
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const { pathname } = useLocation();
  const role = pathname.startsWith("/admin") ? "admin" : "student";
  const isPortal =
    pathname.startsWith("/student") || pathname.startsWith("/admin");
  const reload = useCallback(
    async (signal) => {
      if (!api.configured) return;
      setStatus("loading");
      setError("");
      try {
        const payload = await api.request(`/portal/${role}`, { signal });
        if (!signal?.aborted) {
          setDb(normalizePortal(payload));
          setStatus("ready");
        }
      } catch (err) {
        if (!signal?.aborted) {
          setDb(createEmptyPortal());
          setError(err.message);
          setStatus("error");
        }
      }
    },
    [role],
  );
  useEffect(() => {
    const controller = new AbortController();
    setDb(createEmptyPortal());
    if (import.meta.env.DEV && isPortal) reload(controller.signal);
    return () => controller.abort();
  }, [role, reload, isPortal]);
  const notify = (message, type = "success") => setNotice({ message, type });
  return (
    <Context.Provider
      value={{
        db,
        student: db.currentStudent,
        role,
        status,
        error,
        reload,
        notify,
        api,
      }}
    >
      {children}
      {notice && (
        <div className={`toast ${notice.type}`} role="status">
          <span>{notice.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export const usePortal = () => useContext(Context);
