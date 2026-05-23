import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { policyApi } from '../../../src/lib/api';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { colors, cardShadow, TYPE_LABELS } from '../../../src/lib/theme';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function PolicyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const policyId = Number(id);

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => policyApi.getById(policyId),
    enabled: !!policyId,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!policy) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: colors.textSecondary }}>Policy not found</Text>
      </View>
    );
  }

  const start = new Date(policy.startDate).toLocaleDateString('en-IL', { day: '2-digit', month: 'short', year: 'numeric' });
  const end = new Date(policy.endDate).toLocaleDateString('en-IL', { day: '2-digit', month: 'short', year: 'numeric' });
  const daysLeft = Math.ceil((new Date(policy.endDate).getTime() - Date.now()) / 86_400_000);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Policy Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.policyNumBadge}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
            <Text style={styles.policyNumText}>{policy.policyNumber}</Text>
          </View>
          <StatusBadge status={policy.status} />
        </View>
        <Text style={styles.customerName}>{policy.customerName}</Text>
        <Text style={styles.typeLabel}>{TYPE_LABELS[policy.type] ?? policy.type} Insurance</Text>
        <View style={styles.premiumRow}>
          <Text style={styles.premiumValue}>₪{policy.premium.toLocaleString()}</Text>
          <Text style={styles.premiumPer}>/month</Text>
        </View>
      </View>

      {/* Days remaining */}
      {daysLeft > 0 && (
        <View style={[
          styles.daysCard,
          daysLeft <= 30 ? styles.daysCardWarning : daysLeft <= 90 ? styles.daysCardCaution : {},
        ]}>
          <Ionicons
            name="time-outline"
            size={18}
            color={daysLeft <= 30 ? colors.danger : daysLeft <= 90 ? colors.warning : colors.primary}
          />
          <Text style={[
            styles.daysText,
            daysLeft <= 30 ? styles.daysTextWarning : daysLeft <= 90 ? styles.daysTextCaution : {},
          ]}>
            {daysLeft} days remaining
          </Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policy Details</Text>
        <View style={styles.detailsCard}>
          <DetailRow label="Policy Number" value={policy.policyNumber} />
          <DetailRow label="Type" value={TYPE_LABELS[policy.type] ?? policy.type} />
          <DetailRow label="Status" value={policy.status} />
          <DetailRow label="Start Date" value={start} />
          <DetailRow label="End Date" value={end} />
          <DetailRow label="Premium" value={`₪${policy.premium.toLocaleString()}/mo`} />
          <DetailRow label="Agent" value={policy.agentEmail} />
        </View>
      </View>

      {/* Customer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        <Pressable
          style={styles.customerCard}
          onPress={() => router.push(`/(app)/customers/${policy.customerId}`)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{policy.customerName[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerNameLink}>{policy.customerName}</Text>
            <Text style={styles.customerSub}>Tap to view client profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
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
  heroCard: {
    backgroundColor: colors.card, marginHorizontal: 16, borderRadius: 20,
    padding: 20, marginBottom: 12, ...cardShadow,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  policyNumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  policyNumText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  customerName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  typeLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  premiumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  premiumValue: { fontSize: 32, fontWeight: '700', color: colors.text },
  premiumPer: { fontSize: 14, color: colors.textMuted },
  daysCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 12,
    backgroundColor: colors.primaryLight,
  },
  daysCardWarning: { backgroundColor: colors.dangerLight },
  daysCardCaution: { backgroundColor: colors.warningLight },
  daysText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  daysTextWarning: { color: colors.danger },
  daysTextCaution: { color: colors.warning },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  detailsCard: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', ...cardShadow },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  detailLabel: { fontSize: 13, color: colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: '500', color: colors.text },
  customerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 14, padding: 14, ...cardShadow,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  customerNameLink: { fontSize: 15, fontWeight: '600', color: colors.text },
  customerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
