/**
 * Color constants used throughout the application
 * Centralized color definitions for consistency and maintainability
 */

export const BRAND_COLORS = {
  primary: '#33A6B8',
  primaryDark: '#2A8A99',
} as const;

export const HEALTH_STATUS_COLORS = {
  healthy: {
    bg: '#dcfce7',
    color: '#16a34a',
    icon: 'mdi:check-circle',
  },
  unhealthy: {
    bg: '#fee2e2',
    color: '#dc2626',
    icon: 'mdi:alert-circle',
  },
  warning: {
    bg: '#fef3c7',
    color: '#f59e0b',
    icon: 'mdi:alert',
  },
  unknown: {
    bg: '#f3f4f6',
    color: '#6b7280',
    icon: 'mdi:help-circle',
  },
} as const;

export const TIER_COLORS = {
  presentation: {
    primary: '#2563eb',
    bg: '#dbeafe',
  },
  application: {
    primary: '#ea580c',
    bg: '#fed7aa',
  },
  data: {
    primary: '#9333ea',
    bg: '#e9d5ff',
  },
} as const;

export const UI_COLORS = {
  border: '#e5e7eb',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  slate: {
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
  },
  purple: {
    400: '#a78bfa',
    600: '#7c3aed',
  },
} as const;
