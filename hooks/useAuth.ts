import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://192.168.0.139:8000';

export function useAuth() {
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar tokens do storage ao iniciar
  useEffect(() => {
    (async () => {
      const storedAccess = await AsyncStorage.getItem('access');
      const storedRefresh = await AsyncStorage.getItem('refresh');
      setAccess(storedAccess);
      setRefresh(storedRefresh);
      setLoading(false);
    })();
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Credenciais inválidas');
    const data = await res.json();

    await AsyncStorage.setItem('access', data.access);
    await AsyncStorage.setItem('refresh', data.refresh);

    setAccess(data.access);
    setRefresh(data.refresh);
  }, []);

  // Refresh do access token
  const refreshAccess = useCallback(async () => {
    if (!refresh) return null;
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      await AsyncStorage.setItem('access', data.access);
      setAccess(data.access);
      return data.access;
    } else {
      logout();
      return null;
    }
  }, [refresh]);

  // Logout
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['access', 'refresh']);
    setAccess(null);
    setRefresh(null);
  }, []);

  // Função helper para chamadas autenticadas
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = access;
      if (!token) {
        token = await refreshAccess();
        if (!token) throw new Error('Não autenticado');
      }

      const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Se o token expirou, tenta refresh e repete
      if (res.status === 401) {
        token = await refreshAccess();
        if (!token) throw new Error('Sessão expirada');
        return fetch(`${API_URL}${url}`, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      return res;
    },
    [access, refreshAccess]
  );

  return { access, refresh, loading, login, logout, authFetch };
}
