import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { getApiBaseUrl } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const { access, refresh, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();              // limpa tokens do AsyncStorage
    router.replace('/login');    // volta para tela de login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sessão</Text>
      <Text style={styles.item}>API: {getApiBaseUrl()}</Text>
      <Text style={styles.item}>Access: {access ? 'OK' : 'Ausente'}</Text>
      <Text style={styles.item}>Refresh: {refresh ? 'OK' : 'Ausente'}</Text>
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  item: { fontSize: 14 },
});
