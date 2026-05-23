import { StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS } from '../lib/theme';

interface Props { status: string; }

export function StatusBadge({ status }: Props) {
  const c = STATUS_COLORS[status] ?? { bg: '#f1f5f9', text: '#64748b' };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11, fontWeight: '600' },
});
