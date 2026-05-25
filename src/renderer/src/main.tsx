import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, Global, css } from '@emotion/react'
import App from './App'
import { lightTheme } from './design-system/theme'
import '@fontsource-variable/inter'

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    font-weight: normal;
  }

  body {
    font-family: 'Inter Variable', Inter, sans-serif;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <Global styles={globalStyles} />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
