import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.139:8000/api/api-token-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      console.log('Status da resposta:', response.status);

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        router.replace({ pathname: '/dashboard' } as any);
      } else {
        Alert.alert('Login falhou', data.error || 'Usuário ou senha inválidos');
      }
    } catch (error) {
      console.log('Erro de login:', error);
      Alert.alert('Erro de conexão', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/fujiarte-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Entrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
