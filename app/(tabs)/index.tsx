import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

type Employee = {
  employee_id?: string;
  name_en?: string;
  name_jp?: string;
  department?: number | null;
  active_end_month?: boolean;
  manager_flag?: boolean;
};

type Profile = {
  username?: string;
  email?: string;
};

type DashboardData = {
  employees: Employee[];
  profile: Profile | null;
};

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tone }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.82}>
      <Ionicons name={icon} size={22} color="#FB0020" />
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { authFetch, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData>({ employees: [], profile: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const profile = await authFetch('/api/profile/');
      const employees = await authFetch('/api/employees/');

      setData({
        profile: profile ?? null,
        employees: Array.isArray(employees) ? employees : [],
      });
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Nao foi possivel carregar o dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (authLoading) return;
    loadDashboard();
  }, [authLoading, loadDashboard]);

  const activeEmployees = useMemo(
    () => data.employees.filter((employee) => employee.active_end_month).length,
    [data.employees]
  );

  const managers = useMemo(
    () => data.employees.filter((employee) => employee.manager_flag).length,
    [data.employees]
  );

  const latestEmployees = data.employees.slice(0, 4);
  const userName = data.profile?.username || 'Usuario';

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FB0020" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>FujiHub Mobile</Text>
          <Text style={styles.title}>Ola, {userName}</Text>
        </View>
        <View style={styles.logoMark}>
          <Ionicons name="analytics-outline" size={26} color="#FB0020" />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <StatCard label="Funcionarios" value={data.employees.length} icon="people-outline" tone="#111827" />
        <StatCard label="Ativos no mes" value={activeEmployees} icon="checkmark-circle-outline" tone="#16a34a" />
        <StatCard label="Gestores" value={managers} icon="shield-checkmark-outline" tone="#2563eb" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atalhos</Text>
        <ActionButton
          label="Cadastrar funcionario"
          icon="person-add-outline"
          onPress={() => router.push('/(tabs)/register')}
        />
        <ActionButton
          label="Ver funcionarios"
          icon="list-outline"
          onPress={() => router.push('/(tabs)/employees')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ultimos registros</Text>
        {latestEmployees.length > 0 ? (
          latestEmployees.map((employee) => (
            <View key={employee.employee_id} style={styles.employeeRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(employee.name_en || employee.name_jp || employee.employee_id || '?').slice(0, 1)}
                </Text>
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {employee.name_en || employee.name_jp || 'Sem nome'}
                </Text>
                <Text style={styles.employeeId}>{employee.employee_id}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum funcionario cadastrado ainda.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
    marginTop: 12,
    color: '#4b5563',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 12,
  },
  eyebrow: {
    color: '#FB0020',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    color: '#991b1b',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    marginBottom: 12,
    width: 34,
  },
  statValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 16,
  },
  actionLabel: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  employeeRow: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  employeeId: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
