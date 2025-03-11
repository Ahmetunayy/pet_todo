import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colorScheme === 'dark' ? '#2D2D2D' : "#F5D3C8",

          overflow: 'hidden',
        }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
