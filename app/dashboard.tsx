import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import DashboardScreen from './screens/DashboardScreen';

export default function ProtectedDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace({ pathname: '/login' } as any);
      } else {
        setCheckingAuth(false); // autorizado, pode renderizar
      }
    };

    checkToken();
  }, [router]);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' }}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return <DashboardScreen />;
}
