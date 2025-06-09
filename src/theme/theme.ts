import { useThemeContext } from './ThemeContext';

export function useTheme() {
  const { theme } = useThemeContext();
  return theme;
}
