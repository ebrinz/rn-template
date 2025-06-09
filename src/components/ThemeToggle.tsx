import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '../theme/ThemeContext';

const MODES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Default', value: 'default' },
];

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeContext();

  return (
    <View style={styles.container}>
      {MODES.map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[styles.button, mode === value && styles.selected]}
          onPress={() => setMode(value as any)}
        >
          <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', margin: 16 },
  button: {
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
  },
  selected: {
    borderColor: '#007AFF',
    backgroundColor: '#ddeeff',
  },
  text: { fontWeight: 'bold' },
});
