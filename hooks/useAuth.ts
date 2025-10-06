import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://192.168.0.139:8000';
const apiUrl = (path: string) => `${API_URL}${path}`;

export function useAuth() {
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar tokens ao iniciar
  useEffect(() => {
    (async () => {
      const storedAccess = await AsyncStorage.getItem('access');
      const storedRefresh = await AsyncStorage.getItem('refresh');
      setAccess(storedAccess);
      setRefresh(storedRefresh);
      setLoading(false);
    })();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['access', 'refresh']);
    setAccess(null);
    setRefresh(null);
    router.replace('/login'); // força redirecionamento
  }, [router]);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(apiUrl('/api/token/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Credenciais inválidas');
    const data = await res.json();
    console.log('LOGIN DATA:', data);

    // Aceita múltiplos formatos
    const accessToken = data.access ?? data.token;
    const refreshToken = data.refresh ?? data.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error('Resposta inválida do servidor');
    }

    await AsyncStorage.setItem('access', accessToken);
    await AsyncStorage.setItem('refresh', refreshToken);

    setAccess(accessToken);
    setRefresh(refreshToken);
    return accessToken;
  }, []);

  // Refresh
  const refreshAccess = useCallback(async () => {
    if (!refresh) return null;
    try {
      const res = await fetch(apiUrl('/api/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      console.log('REFRESH STATUS:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('REFRESH DATA:', data);

        const newAccess = data.access ?? data.token;
        if (!newAccess) {
          await logout();
          return null;
        }

        await AsyncStorage.setItem('access', newAccess);
        setAccess(newAccess);
        return newAccess;
      } else {
        await logout();
        return null;
      }
    } catch (err) {
      console.error('REFRESH ERROR:', err);
      await logout();
      return null;
    }
  }, [refresh, logout]);

  // Fetch autenticado
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = access;

      // Se ainda não carregou no estado, tenta pegar direto do AsyncStorage
      if (!token) {
        token = await AsyncStorage.getItem('access');
      }

      // Se mesmo assim não tiver, tenta refresh
      if (!token) {
        token = await refreshAccess();
      }

      console.log('AUTHFETCH TOKEN:', token);

      if (!token) {
        console.log('AUTHFETCH: sem token, forçando logout');
        await logout();
        throw new Error('Não autenticado');
      }

      let res = await fetch(apiUrl(url), {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`, // 👈 talvez precise ser "Token"
          'Content-Type': 'application/json',
        },
      });

      console.log('AUTHFETCH STATUS:', res.status);

      if (res.status === 401) {
        console.log('AUTHFETCH: 401, tentando refresh');
        token = await refreshAccess();
        if (!token) {
          await logout();
          throw new Error('Sessão expirada');
        }
        res = await fetch(apiUrl(url), {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      return res.json();
    },
    [access, refreshAccess, logout]
  );

  return { access, refresh, loading, login, logout, authFetch, refreshAccess };
}
