// app/screens/DashboardScreen.tsx
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { authFetch, logout, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🔒 Função de logout estável
  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/login');
  }, [logout, router]);

  useEffect(() => {
    if (loading) return;

    (async () => {
      try {
        setLoadingProfile(true);
        const res = await authFetch('/api/profile/');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setError('Não foi possível carregar o perfil');
          handleLogout(); // usa a função estável
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [loading, authFetch, handleLogout]);

  if (loading || loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FB0020" />
        <Text style={styles.text}>Carregando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erro: {error}</Text>
        <Button title="Sair" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo, {profile?.username} 👋</Text>
      <Text style={styles.info}>ID: {profile?.id}</Text>
      <Text style={styles.info}>Email: {profile?.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
  },
  welcome: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 12,
  },
  info: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 6,
  },
  text: {
    color: '#fff',
    marginTop: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
