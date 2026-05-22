import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

type Option = {
  id: number;
  code?: string;
  label_pt?: string;
  name_pt?: string;
};

type OptionsState = {
  genders: Option[];
  shifts: Option[];
  departments: Option[];
  nationalities: Option[];
  processes: Option[];
  hireTypes: Option[];
};

type EmployeeForm = {
  employee_id: string;
  name_en: string;
  name_jp: string;
  internal_name: string;
  employee_cd: string;
  workplace_name: string;
  joined_imc: string;
  birth_date: string;
  notes: string;
  gender: number | null;
  shift: number | null;
  department: number | null;
  nationality: number | null;
  process: number | null;
  hire_type: number | null;
  active_end_month: boolean;
  manager_flag: boolean;
  view_flag: boolean;
};

const initialForm: EmployeeForm = {
  employee_id: '',
  name_en: '',
  name_jp: '',
  internal_name: '',
  employee_cd: '',
  workplace_name: '',
  joined_imc: '',
  birth_date: '',
  notes: '',
  gender: null,
  shift: null,
  department: null,
  nationality: null,
  process: null,
  hire_type: null,
  active_end_month: true,
  manager_flag: false,
  view_flag: true,
};

const optionEndpoints: { key: keyof OptionsState; path: string }[] = [
  { key: 'genders', path: '/api/genders/' },
  { key: 'shifts', path: '/api/shifts/' },
  { key: 'departments', path: '/api/departments/' },
  { key: 'nationalities', path: '/api/nationalities/' },
  { key: 'processes', path: '/api/processes/' },
  { key: 'hireTypes', path: '/api/hiretypes/' },
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
      />
    </View>
  );
}

function OptionChips({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | null;
  options: Option[];
  onChange: (value: number | null) => void;
}) {
  const getLabel = (option: Option) => option.label_pt || option.name_pt || option.code || String(option.id);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, value === null && styles.chipActive]}
          onPress={() => onChange(null)}
        >
          <Text style={[styles.chipText, value === null && styles.chipTextActive]}>Nenhum</Text>
        </TouchableOpacity>
        {options.map((option) => {
          const active = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(option.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{getLabel(option)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#fecaca' }}
        thumbColor={value ? '#FB0020' : '#f9fafb'}
      />
    </View>
  );
}

export default function RegisterEmployeeScreen() {
  const { authFetch } = useAuth();
  const [form, setForm] = useState<EmployeeForm>(initialForm);
  const [options, setOptions] = useState<OptionsState>({
    genders: [],
    shifts: [],
    departments: [],
    nationalities: [],
    processes: [],
    hireTypes: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const entries = await Promise.all(
        optionEndpoints.map(async (endpoint) => {
          const data = await authFetch(endpoint.path);
          return [endpoint.key, Array.isArray(data) ? data : []] as const;
        })
      );

      setOptions((current) => ({
        ...current,
        ...Object.fromEntries(entries),
      }));
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Nao foi possivel carregar as opcoes');
    } finally {
      setLoadingOptions(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const setValue = <K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const cleanPayload = () => ({
    ...form,
    employee_id: form.employee_id.trim(),
    name_en: form.name_en.trim(),
    name_jp: form.name_jp.trim(),
    internal_name: form.internal_name.trim(),
    employee_cd: form.employee_cd.trim(),
    workplace_name: form.workplace_name.trim(),
    joined_imc: form.joined_imc || null,
    birth_date: form.birth_date || null,
    notes: form.notes.trim(),
  });

  const handleSubmit = async () => {
    if (!form.employee_id.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o ID do funcionario.');
      return;
    }

    if (!form.name_en.trim() || !form.name_jp.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o nome em ingles e o nome em japones.');
      return;
    }

    try {
      setSubmitting(true);
      await authFetch('/api/employees/', {
        method: 'POST',
        body: JSON.stringify(cleanPayload()),
      });

      Alert.alert('Cadastro salvo', 'Funcionario cadastrado com sucesso.');
      setForm(initialForm);
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err.message ?? 'Nao foi possivel cadastrar o funcionario.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Novo registro</Text>
            <Text style={styles.title}>Cadastrar funcionario</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="person-add-outline" size={24} color="#FB0020" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificacao</Text>
          <Field
            label="ID do funcionario"
            value={form.employee_id}
            onChangeText={(value) => setValue('employee_id', value)}
            placeholder="Ex: 100245"
          />
          <Field
            label="Codigo do funcionario"
            value={form.employee_cd}
            onChangeText={(value) => setValue('employee_cd', value)}
          />
          <Field
            label="Nome em ingles"
            value={form.name_en}
            onChangeText={(value) => setValue('name_en', value)}
            placeholder="Nome usado no sistema"
          />
          <Field
            label="Nome em japones"
            value={form.name_jp}
            onChangeText={(value) => setValue('name_jp', value)}
          />
          <Field
            label="Nome interno"
            value={form.internal_name}
            onChangeText={(value) => setValue('internal_name', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados pessoais</Text>
          <Field
            label="Data de nascimento"
            value={form.birth_date}
            onChangeText={(value) => setValue('birth_date', value)}
            placeholder="AAAA-MM-DD"
          />

          {loadingOptions ? (
            <View style={styles.optionsLoading}>
              <ActivityIndicator color="#FB0020" />
              <Text style={styles.optionsLoadingText}>Carregando opcoes...</Text>
            </View>
          ) : (
            <>
              <OptionChips
                label="Genero"
                value={form.gender}
                options={options.genders}
                onChange={(value) => setValue('gender', value)}
              />
              <OptionChips
                label="Nacionalidade"
                value={form.nationality}
                options={options.nationalities}
                onChange={(value) => setValue('nationality', value)}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empresa e alocacao</Text>
          <Field
            label="Local de trabalho"
            value={form.workplace_name}
            onChangeText={(value) => setValue('workplace_name', value)}
          />
          <Field
            label="Entrada IMC"
            value={form.joined_imc}
            onChangeText={(value) => setValue('joined_imc', value)}
            placeholder="AAAA-MM-DD"
          />

          {!loadingOptions ? (
            <>
              <OptionChips
                label="Departamento"
                value={form.department}
                options={options.departments}
                onChange={(value) => setValue('department', value)}
              />
              <OptionChips
                label="Turno"
                value={form.shift}
                options={options.shifts}
                onChange={(value) => setValue('shift', value)}
              />
              <OptionChips
                label="Processo"
                value={form.process}
                options={options.processes}
                onChange={(value) => setValue('process', value)}
              />
              <OptionChips
                label="Tipo de contratacao"
                value={form.hire_type}
                options={options.hireTypes}
                onChange={(value) => setValue('hire_type', value)}
              />
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controle</Text>
          <ToggleRow
            label="Ativo no fim do mes"
            value={form.active_end_month}
            onValueChange={(value) => setValue('active_end_month', value)}
          />
          <ToggleRow
            label="Gestor"
            value={form.manager_flag}
            onValueChange={(value) => setValue('manager_flag', value)}
          />
          <ToggleRow
            label="Pode visualizar"
            value={form.view_flag}
            onValueChange={(value) => setValue('view_flag', value)}
          />
          <Field
            label="Observacoes"
            value={form.notes}
            onChangeText={(value) => setValue('notes', value)}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setForm(initialForm)}
            disabled={submitting}
          >
            <Text style={styles.secondaryText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={19} color="#fff" />
                <Text style={styles.primaryText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingTop: 12,
  },
  eyebrow: {
    color: '#FB0020',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  section: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    color: '#374151',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  optionsLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  optionsLoadingText: {
    color: '#6b7280',
  },
  toggleRow: {
    alignItems: 'center',
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FB0020',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
