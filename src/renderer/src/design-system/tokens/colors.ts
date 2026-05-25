export const lightColors = {
  bg: {
    base:    '#ffffff',
    surface: '#f7f7f8',
    overlay: '#ffffff',
    sunken:  '#f0f0f2',
  },
  text: {
    primary:   '#111827',
    secondary: '#374151',
    muted:     '#6b7280',
    disabled:  '#9ca3af',
    inverse:   '#ffffff',
  },
  border: {
    subtle:  '#e5e7eb',
    default: '#d1d5db',
    strong:  '#9ca3af',
  },
  accent: {
    default: '#2563eb',
    hover:   '#1d4ed8',
    muted:   '#dbeafe',
  },
  danger: {
    default: '#dc2626',
    muted:   '#fee2e2',
  },
  success: {
    default: '#16a34a',
    muted:   '#dcfce7',
  },
} as const

export type Colors = typeof lightColors
export const darkColors: Colors = lightColors  // stub — real values in later phase
