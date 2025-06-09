import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { useTheme } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/auth/AuthProvider';

function App(): React.JSX.Element {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
