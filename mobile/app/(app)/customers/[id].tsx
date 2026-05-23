import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerApi, policyApi } from '../../../src/lib/api';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { colors, cardShadow, TYPE_LABELS } from '../../../src/lib/theme';

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getById(customerId),
    enabled: !!customerId,
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['policies', 'customer', customerId],
    queryFn: () => policyApi.getByCustomer(customerId),
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.textSecondary }}>Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back header */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Client Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(customer.firstName[0] ?? '') + (customer.lastName[0] ?? '')}
          </Text>
        </View>
        <Text style={styles.fullName}>{customer.firstName} {customer.lastName}</Text>
        <StatusBadge status={customer.status} />
      </View>

      {/* Info section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label="Email" value={customer.email} />
          <InfoRow icon="call-outline" label="Phone" value={customer.phone} />
          <InfoRow icon="card-outline" label="Israeli ID" value={customer.israeliId} />
          <InfoRow icon="calendar-outline" label="Date of Birth" value={
            new Date(customer.dateOfBirth).toLocaleDateString('en-IL', {
              day: '2-digit', month: 'long', year: 'numeric',
            })
          } />
          <InfoRow icon="briefcase-outline" label="Agent" value={customer.agentEmail} />
        </View>
      </View>

      {/* Policies section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policies ({policies.length})</Text>
        {policies.length === 0 ? (
          <Text style={styles.empty}>No policies for this client</Text>
        ) : (
          policies.map((p) => (
            <Pressable
              key={p.id}
              style={styles.policyCard}
              onPress={() => router.push(`/(app)/policies/${p.id}`)}
            >
              <View style={styles.policyLeft}>
                <Text style={styles.policyNum}>{p.policyNumber}</Text>
                <Text style={styles.policyType}>{TYPE_LABELS[p.type] ?? p.type}</Text>
              </View>
              <View style={styles.policyRight}>
                <StatusBadge status={p.status} />
                <Text style={styles.policyPremium}>₪{p.premium.toLocaleString()}/mo</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...cardShadow,
  },
  topTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  profileCard: {
    alignItems: 'center', backgroundColor: colors.card, marginHorizontal: 16,
    borderRadius: 20, paddingVertical: 28, marginBottom: 16, ...cardShadow,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  fullName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  infoCard: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', ...cardShadow },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.text, marginTop: 1 },
  policyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: 12, padding: 14, marginBottom: 8, ...cardShadow,
  },
  policyLeft: { flex: 1 },
  policyNum: { fontSize: 14, fontWeight: '600', color: colors.text },
  policyType: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  policyRight: { alignItems: 'flex-end', gap: 4 },
  policyPremium: { fontSize: 12, fontWeight: '600', color: colors.primary, marginTop: 4 },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
