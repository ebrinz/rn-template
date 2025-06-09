import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './colors';

type ThemeMode = 'light' | 'dark' | 'default';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: typeof colors.light;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'default',
  setMode: () => {},
  theme: colors.light,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('default');

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(stored => {
      if (stored === 'light' || stored === 'dark' || stored === 'default') setMode(stored);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme =
    mode === 'default'
      ? systemScheme === 'dark'
        ? colors.dark
        : colors.light
      : mode === 'dark'
      ? colors.dark
      : colors.light;

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
