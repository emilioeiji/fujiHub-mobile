import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { parseApiError, requestApi } from '../lib/api';

const ACCESS_KEY = 'access';
const REFRESH_KEY = 'refresh';

export function useAuth() {
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar tokens ao iniciar
  useEffect(() => {
    (async () => {
      const storedAccess = await AsyncStorage.getItem(ACCESS_KEY);
      const storedRefresh = await AsyncStorage.getItem(REFRESH_KEY);
      setAccess(storedAccess);
      setRefresh(storedRefresh);
      setLoading(false);
    })();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
    setAccess(null);
    setRefresh(null);
    router.replace('/login');
  }, [router]);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    const { response, data } = await requestApi('/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error((await parseApiError(response)) || 'Credenciais inválidas');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Resposta inválida do servidor');
    }
    const accessToken = data.access ?? data.token;
    const refreshToken = data.refresh ?? data.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error('Resposta inválida do servidor');
    }

    await AsyncStorage.setItem(ACCESS_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_KEY, refreshToken);

    setAccess(accessToken);
    setRefresh(refreshToken);
    return accessToken;
  }, []);

  // Refresh
  const refreshAccess = useCallback(async () => {
    if (!refresh) return null;
    try {
      const { response, data } = await requestApi('/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const newAccess = data.access ?? data.token;
        if (!newAccess) {
          await logout();
          return null;
        }

        await AsyncStorage.setItem(ACCESS_KEY, newAccess);
        setAccess(newAccess);
        return newAccess;
      }

      await logout();
      return null;
    } catch (err) {
      await logout();
      return null;
    }
  }, [refresh, logout]);

  // Fetch autenticado
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = access;

      if (!token) {
        token = await AsyncStorage.getItem(ACCESS_KEY);
      }

      if (!token) {
        token = await refreshAccess();
      }

      if (!token) {
        await logout();
        throw new Error('Não autenticado');
      }

      let { response, data } = await requestApi(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        token = await refreshAccess();
        if (!token) {
          await logout();
          throw new Error('Sessão expirada');
        }

        const retried = await requestApi(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        response = retried.response;
        data = retried.data;
      }

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      return data;
    },
    [access, logout, refreshAccess]
  );

  return { access, refresh, loading, login, logout, authFetch, refreshAccess };
}
