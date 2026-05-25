import { css, useTheme } from '@emotion/react'
import { padding, radius, shadow } from './design-system'

function TokenSmokeTest() {
  const theme = useTheme()
  return (
    <div
      css={css`
        ${padding.a.p1}
        ${radius.md}
        ${shadow.sm}
        background: ${theme.colors.bg.surface};
        color: ${theme.colors.text.primary};
      `}
    >
      Design tokens sdf.
    </div>
  )
}

export default function App() {
  return (
    <div>
      <TokenSmokeTest />
    </div>
  )
}
