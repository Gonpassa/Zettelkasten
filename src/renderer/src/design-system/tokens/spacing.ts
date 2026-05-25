const VALUES = {
  p0point25: '0.25rem',
  p0point5:  '0.5rem',
  p0point75: '0.75rem',
  p1:        '1rem',
  p1point25: '1.25rem',
  p1point5:  '1.5rem',
  p1point75: '1.75rem',
  p2:        '2rem',
} as const

type SpacingKey = keyof typeof VALUES

const make = (template: (v: string) => string): Record<SpacingKey, string> =>
  Object.fromEntries(
    Object.entries(VALUES).map(([k, v]) => [k, template(v)]),
  ) as Record<SpacingKey, string>

export const padding = {
  a:  make((v) => `padding: ${v};`),
  y:  make((v) => `padding-top: ${v}; padding-bottom: ${v};`),
  x:  make((v) => `padding-left: ${v}; padding-right: ${v};`),
  yt: make((v) => `padding-top: ${v};`),
  yb: make((v) => `padding-bottom: ${v};`),
  xl: make((v) => `padding-left: ${v};`),
  xr: make((v) => `padding-right: ${v};`),
} as const

export const margin = {
  a:  make((v) => `margin: ${v};`),
  y:  make((v) => `margin-top: ${v}; margin-bottom: ${v};`),
  x:  make((v) => `margin-left: ${v}; margin-right: ${v};`),
  yt: make((v) => `margin-top: ${v};`),
  yb: make((v) => `margin-bottom: ${v};`),
  xl: make((v) => `margin-left: ${v};`),
  xr: make((v) => `margin-right: ${v};`),
} as const
