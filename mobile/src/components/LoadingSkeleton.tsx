import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

function SkeletonItem({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width ?? '100%', height, opacity },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonItem width={120} height={14} />
        <SkeletonItem width={60} height={20} style={{ borderRadius: 10 }} />
      </View>
      <SkeletonItem width="80%" height={12} style={{ marginTop: 8 }} />
      <SkeletonItem width="60%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#cbd5e1',
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
