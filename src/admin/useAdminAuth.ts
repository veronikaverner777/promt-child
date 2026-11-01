import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
export function useAdminAuth() {
  const lastUser = useRef<string | null>(null);
  const [session, setSession] = useState<Session | null>(null),
    [initializing, setInitializing] = useState(Boolean(supabase)),
    [checking, setChecking] = useState(false),
    [admin, setAdmin] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) return;
    let live = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, value) => {
      if (live) {
        setSession(value);
        if (lastUser.current !== (value?.user.id ?? null)) setAdmin(false);
        lastUser.current = value?.user.id ?? null;
        setChecking(Boolean(value));
        setError("");
        setInitializing(false);
      }
    });
    supabase.auth.getSession().then(({ data, error: err }) => {
      if (live) {
        setSession(data.session);
        setInitializing(false);
        if (err)
          setError("Не удалось проверить сеанс. Попробуйте войти ещё раз.");
      }
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);
  const checkRole = useCallback(async () => {
    if (!supabase || !session) {
      setAdmin(false);
      return;
    }
    setChecking(true);
    setError("");
    const { data, error: err } = await supabase.rpc("is_admin");
    if (err) {
      setAdmin(false);
      setError(
        "Не удалось проверить права. Проверьте подключение и SQL-схему Supabase.",
      );
    } else setAdmin(data === true);
    setChecking(false);
  }, [session]);
  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    setError("");
    void supabase!.rpc("is_admin").then(({ data, error: err }) => {
      if (cancelled) return;
      setAdmin(!err && data === true);
      setError(
        err
          ? "Не удалось проверить права. Проверьте подключение и SQL-схему Supabase."
          : "",
      );
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);
  return {
    session,
    loading: initializing || checking,
    admin,
    error,
    checkRole,
  };
}
