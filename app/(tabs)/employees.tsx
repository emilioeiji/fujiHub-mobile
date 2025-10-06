import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await authFetch('/api/employees/');
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setError('Formato inesperado da resposta da API');
        }
      } catch (err: any) {
        console.error('ERRO FETCH:', err);
        setError(err.message ?? 'Erro ao buscar funcionários');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [authFetch]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        keyExtractor={(item, index) => item.employee_id?.toString() ?? index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name_en}</Text>
            <Text>{item.employee_id}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum funcionário encontrado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontWeight: 'bold', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
