import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi, CustomerResponse } from '../../../src/lib/api';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { EmptyState } from '../../../src/components/EmptyState';
import { SkeletonList } from '../../../src/components/LoadingSkeleton';
import { colors, cardShadow } from '../../../src/lib/theme';

type Filter = 'ALL' | 'ACTIVE' | 'PROSPECT' | 'INACTIVE';
const FILTERS: Filter[] = ['ALL', 'ACTIVE', 'PROSPECT', 'INACTIVE'];
const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All', ACTIVE: 'Active', PROSPECT: 'Prospect', INACTIVE: 'Inactive',
};

function CustomerCard({ customer }: { customer: CustomerResponse }) {
  const initials =
    (customer.firstName[0] ?? '') + (customer.lastName[0] ?? '');

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/customers/${customer.id}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.name}>{customer.firstName} {customer.lastName}</Text>
          <StatusBadge status={customer.status} />
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="mail-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{customer.email}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Ionicons name="call-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{customer.phone}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getAll,
  });

  const filtered = useMemo(() => {
    let list = data;
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }
    return list;
  }, [data, filter, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.count}>{data.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search clients…"
          placeholderTextColor={colors.textMuted}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <SkeletonList count={6} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => <CustomerCard customer={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={search || filter !== 'ALL' ? 'No matching clients' : 'No clients yet'}
              description={
                search || filter !== 'ALL'
                  ? 'Try adjusting your search or filter'
                  : 'Add your first client to get started'
              }
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(app)/customers/index')}
      >
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border, ...cardShadow,
  },
  searchIcon: { paddingLeft: 12 },
  searchInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 11, fontSize: 15, color: colors.text },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filterTabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, ...cardShadow,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
});
