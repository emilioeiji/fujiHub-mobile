import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function IndexRedirect() {
  const router = useRouter();
  const { access, refresh, loading, refreshAccess } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (access) {
        router.replace('/(tabs)');
      } else if (refresh) {
        const newAccess = await refreshAccess();
        if (newAccess) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [access, refresh, loading, refreshAccess, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
