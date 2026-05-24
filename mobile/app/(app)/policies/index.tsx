import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { Ionicons } from '@expo/vector-icons';
import { policyApi, PolicyResponse } from '../../../src/lib/api';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { EmptyState } from '../../../src/components/EmptyState';
import { SkeletonList } from '../../../src/components/LoadingSkeleton';
import { colors, cardShadow, TYPE_LABELS } from '../../../src/lib/theme';

type StatusFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
type TypeFilter = 'ALL' | 'CAR' | 'APARTMENT' | 'LIFE' | 'HEALTH';

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'];
const TYPE_FILTERS: TypeFilter[] = ['ALL', 'CAR', 'APARTMENT', 'LIFE', 'HEALTH'];
const TYPE_FILTER_LABELS: Record<TypeFilter, string> = {
  ALL: 'All', CAR: 'Auto', APARTMENT: 'Home', LIFE: 'Life', HEALTH: 'Health',
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CAR: 'car-sport', APARTMENT: 'home', LIFE: 'heart', HEALTH: 'fitness',
};

const TYPE_COLORS: Record<string, { icon: string; bg: string }> = {
  CAR:       { icon: '#0ea5e9', bg: '#e0f2fe' },
  APARTMENT: { icon: '#10b981', bg: '#d1fae5' },
  LIFE:      { icon: '#f43f5e', bg: '#ffe4e6' },
  HEALTH:    { icon: '#8b5cf6', bg: '#ede9fe' },
};

function PolicyCard({ policy }: { policy: PolicyResponse }) {
  const tc = TYPE_COLORS[policy.type] ?? { icon: colors.primary, bg: colors.primaryLight };
  const icon = TYPE_ICONS[policy.type] ?? 'document-text';
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/(app)/policies/${policy.id}`)}>
      <View style={[styles.typeIcon, { backgroundColor: tc.bg }]}>
        <Ionicons name={icon} size={20} color={tc.icon} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.policyNum}>{policy.policyNumber}</Text>
          <StatusBadge status={policy.status} />
        </View>
        <Text style={styles.customerName} numberOfLines={1}>{policy.customerName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.typeLabel}>{TYPE_LABELS[policy.type] ?? policy.type}</Text>
          <Text style={styles.premium}>₪{policy.premium.toLocaleString()}/mo</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function PoliciesScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['policies'],
    queryFn: policyApi.getAll,
  });

  const filtered = useMemo(() => {
    let list = data;
    if (statusFilter !== 'ALL') list = list.filter((p) => p.status === statusFilter);
    if (typeFilter !== 'ALL') list = list.filter((p) => p.type === typeFilter);
    return list;
  }, [data, statusFilter, typeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Policies</Text>
        <Text style={styles.count}>{data.length}</Text>
      </View>

      {/* Status filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: SCREEN_WIDTH }}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, statusFilter === f && styles.chipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>
              {f === 'ALL' ? 'All Status' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterTrail} />
      </ScrollView>

      {/* Type filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: SCREEN_WIDTH }}
        contentContainerStyle={[styles.filterRow, styles.filterRowType]}
      >
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, styles.chipType, typeFilter === f && styles.chipActive]}
            onPress={() => setTypeFilter(f)}
          >
            <Text style={[styles.chipText, typeFilter === f && styles.chipTextActive]}>
              {TYPE_FILTER_LABELS[f]}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterTrail} />
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <SkeletonList count={6} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <PolicyCard policy={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No matching policies' : 'No policies yet'}
              description="Policies will appear here once created"
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, flex: 1 },
  count: {
    fontSize: 14, fontWeight: '600', color: colors.primary,
    backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 16, paddingTop: 4, paddingBottom: 4,
  },
  filterRowType: { paddingTop: 0, paddingBottom: 8 },
  filterTrail: { width: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    marginRight: 8,
  },
  chipType: { backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, ...cardShadow,
  },
  typeIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  policyNum: { fontSize: 14, fontWeight: '600', color: colors.text },
  customerName: { fontSize: 13, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  typeLabel: { fontSize: 12, color: colors.textMuted },
  premium: { fontSize: 13, fontWeight: '600', color: colors.primary },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
});
