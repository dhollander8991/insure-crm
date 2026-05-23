export const colors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#e0e7ff',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  grey: '#6b7280',
  greyLight: '#f1f5f9',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: colors.successLight, text: colors.success },
  PROSPECT:  { bg: colors.warningLight, text: colors.warning },
  PENDING:   { bg: colors.warningLight, text: colors.warning },
  INACTIVE:  { bg: colors.dangerLight,  text: colors.danger  },
  EXPIRED:   { bg: colors.dangerLight,  text: colors.danger  },
  CANCELLED: { bg: colors.greyLight,    text: colors.grey    },
};

export const TYPE_LABELS: Record<string, string> = {
  CAR: 'Auto', APARTMENT: 'Home', LIFE: 'Life', HEALTH: 'Health',
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', INACTIVE: 'Inactive', PROSPECT: 'Prospect',
  PENDING: 'Pending', EXPIRED: 'Expired', CANCELLED: 'Cancelled',
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};
