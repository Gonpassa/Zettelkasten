import { lightColors, darkColors, type Colors } from './tokens/colors'

export interface Theme {
  colors: Colors
}

export const lightTheme: Theme = { colors: lightColors }
export const darkTheme: Theme = { colors: darkColors }
