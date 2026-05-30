import { css, useTheme } from '@emotion/react'

interface Props {
  message: string
}

export function EmptyState({ message }: Props) {
  const theme = useTheme()
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: ${theme.colors.text.muted};
        font-size: 0.875rem;
      `}
    >
      {message}
    </div>
  )
}
