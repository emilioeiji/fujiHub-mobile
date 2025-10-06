import { useRouter } from 'expo-router';
import { Button, StyleSheet, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();              // limpa tokens do AsyncStorage
    router.replace('/login');    // volta para tela de login
  };

  return (
    <View style={styles.container}>
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
