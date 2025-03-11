import React from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        intensity={80}
        style={[
          StyleSheet.absoluteFill,
          {

            overflow: 'hidden',
            backgroundColor: colorScheme === 'dark'
              ? 'rgba(45, 45, 45, 0.7)'
              : 'rgba(245, 211, 200, 0.7)',
          }
        ]}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
