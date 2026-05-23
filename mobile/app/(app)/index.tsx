import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi, emailStorage, policyApi } from '../../src/lib/api';
import { StatusBadge } from '../../src/components/StatusBadge';
import { colors, cardShadow } from '../../src/lib/theme';

interface KpiCardProps {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

function KpiCard({ label, value, icon, color, bg }: KpiCardProps) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: color }]}>
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    emailStorage.get().then((e) => setEmail(e ?? ''));
  }, []);

  const customersQ = useQuery({ queryKey: ['customers'], queryFn: customerApi.getAll });
  const policiesQ = useQuery({ queryKey: ['policies'], queryFn: policyApi.getAll });

  const customers = customersQ.data ?? [];
  const policies = policiesQ.data ?? [];

  const active = policies.filter((p) => p.status === 'ACTIVE').length;
  const prospects = customers.filter((c) => c.status === 'PROSPECT').length;
  const expired = policies.filter((p) => p.status === 'EXPIRED').length;
  const totalPremium = policies
    .filter((p) => p.status === 'ACTIVE')
    .reduce((s, p) => s + p.premium, 0);

  const recentPolicies = [...policies]
    .sort((a, b) => a.id - b.id)
    .slice(-3)
    .reverse();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([customersQ.refetch(), policiesQ.refetch()]);
    setRefreshing(false);
  };

  const loading = customersQ.isLoading || policiesQ.isLoading;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMini}>
            <Ionicons name="shield-checkmark" size={18} color="#fff" />
          </View>
          <Text style={styles.logoLabel}>InsureCRM</Text>
        </View>
        <View style={styles.avatarBtn}>
          <Ionicons name="person" size={18} color={colors.primary} />
        </View>
      </View>

      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.greetingEmail} numberOfLines={1}>
          {email || 'Agent'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* KPI Grid */}
          <View style={styles.kpiGrid}>
            <KpiCard label="Active Policies" value={active} icon="document-text" color="#6366f1" bg="#e0e7ff" />
            <KpiCard label="Total Clients" value={customers.length} icon="people" color="#10b981" bg="#d1fae5" />
            <KpiCard label="Prospects" value={prospects} icon="star" color="#f59e0b" bg="#fef3c7" />
            <KpiCard label="Expired" value={expired} icon="warning" color="#ef4444" bg="#fee2e2" />
          </View>

          {/* Premium banner */}
          <View style={styles.premiumBanner}>
            <View>
              <Text style={styles.premiumLabel}>Monthly Premium (Active)</Text>
              <Text style={styles.premiumValue}>₪{totalPremium.toLocaleString()}</Text>
            </View>
            <Ionicons name="trending-up" size={28} color="#fff" />
          </View>

          {/* Recent Policies */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Policies</Text>
              <Pressable onPress={() => router.push('/(app)/policies/index')}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {recentPolicies.map((p) => (
              <Pressable
                key={p.id}
                style={styles.policyRow}
                onPress={() => router.push(`/(app)/policies/${p.id}`)}
              >
                <View style={styles.policyInfo}>
                  <Text style={styles.policyNum}>{p.policyNumber}</Text>
                  <Text style={styles.policyCustomer} numberOfLines={1}>{p.customerName}</Text>
                </View>
                <View style={styles.policyRight}>
                  <StatusBadge status={p.status} />
                  <Text style={styles.policyPremium}>₪{p.premium.toLocaleString()}</Text>
                </View>
              </Pressable>
            ))}
            {recentPolicies.length === 0 && (
              <Text style={styles.empty}>No policies yet</Text>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/(app)/customers/index')}>
                <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
                  <Ionicons name="person-add" size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Add Client</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/(app)/policies/index')}>
                <View style={[styles.actionIcon, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="document-text" size={22} color="#10b981" />
                </View>
                <Text style={styles.actionLabel}>Add Policy</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => router.push('/(app)/chat')}>
                <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="chatbubbles" size={22} color="#f59e0b" />
                </View>
                <Text style={styles.actionLabel}>Ask AI</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoLabel: { fontSize: 17, fontWeight: '700', color: colors.text },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  greetingSection: { paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text },
  greetingEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10, marginBottom: 16,
  },
  kpiCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: colors.card, borderRadius: 14, padding: 16,
    borderTopWidth: 3, ...cardShadow,
  },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 28, fontWeight: '700', color: colors.text },
  kpiLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  premiumBanner: {
    marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  premiumLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  premiumValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  policyRow: {
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...cardShadow,
  },
  policyInfo: { flex: 1, marginRight: 12 },
  policyNum: { fontSize: 13, fontWeight: '600', color: colors.text },
  policyCustomer: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  policyRight: { alignItems: 'flex-end', gap: 4 },
  policyPremium: { fontSize: 12, fontWeight: '600', color: colors.primary },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});
