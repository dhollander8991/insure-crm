import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { emailStorage, tokenStorage } from '../../src/lib/api';
import { colors, cardShadow } from '../../src/lib/theme';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    emailStorage.get().then((e) => setEmail(e ?? ''));
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await tokenStorage.clear();
          await emailStorage.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initials = email ? email[0].toUpperCase() : '?';
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Avatar card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.email}>{email || '—'}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
          <Text style={styles.roleText}>AGENT</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="mail-outline" label="Email" value={email} />
          <MenuItem icon="shield-outline" label="Role" value="Agent" />
          <MenuItem icon="information-circle-outline" label="App Version" value={`v${version}`} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="business-outline" label="Product" value="InsureCRM" />
          <MenuItem icon="server-outline" label="Backend" value="AWS (35.157.14.12)" />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  avatarCard: {
    alignItems: 'center', backgroundColor: colors.card,
    marginHorizontal: 16, borderRadius: 20, paddingVertical: 28, marginBottom: 24, ...cardShadow,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  email: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', ...cardShadow },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  menuLabel: { fontSize: 14, color: colors.text, flex: 1 },
  menuValue: { fontSize: 13, color: colors.textSecondary, maxWidth: 160 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.dangerLight, borderRadius: 14, paddingVertical: 14,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.danger },
});
