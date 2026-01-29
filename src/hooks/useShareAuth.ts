"use client";

import { useCallback, useState } from "react";

type AuthFn = (id: string, password: string) => Promise<{ token: string }>;

export function useShareAuth(id: string, authFn: AuthFn) {
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = useCallback(
    async (password: string): Promise<string | void> => {
      setAuthLoading(true);
      try {
        const data = await authFn(id, password);
        setToken(data.token);
        return data.token;
      } finally {
        setAuthLoading(false);
      }
    },
    [id, authFn]
  );

  return { token, authLoading, handleAuth };
}
