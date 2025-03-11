import { View, Platform, StyleSheet, TouchableOpacity, LayoutChangeEvent, Animated } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconSymbol } from '../ui/IconSymbol';
import { Feather } from '@expo/vector-icons';
import { TabBarButton } from './TabBarButton';
import { useState } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
          const { colors } = useTheme();
          const { buildHref } = useLinkBuilder();

          const [dimensions, setDimensions] = useState({ width: 100, height: 20 });
          const buttonWidth = dimensions.width / state.routes.length;
          const onTabbarLayout = (event: LayoutChangeEvent) => {
                    setDimensions({
                              width: event.nativeEvent.layout.width,
                              height: event.nativeEvent.layout.height
                    });
          }
          const tabPositionX = useSharedValue(0);
          const animatedStyle = useAnimatedStyle(() => {
                    return {
                              transform: [{ translateX: tabPositionX.value }]
                    }
          })
          return (
                    <View onLayout={onTabbarLayout} style={styles.tabBar}>
                              <Animated.View style={[animatedStyle, {
                                        position: 'absolute',
                                        backgroundColor: '#723FEB',
                                        borderRadius: 30,
                                        marginHorizontal: 12,
                                        height: dimensions.height - 15,
                                        width: buttonWidth - 25,
                              }]} />
                              {state.routes.map((route, index) => {
                                        const { options } = descriptors[route.key];
                                        const label =
                                                  options.tabBarLabel !== undefined
                                                            ? options.tabBarLabel
                                                            : options.title !== undefined
                                                                      ? options.title
                                                                      : route.name;

                                        const isFocused = state.index === index;

                                        const onPress = () => {
                                                  tabPositionX.value = withSpring(buttonWidth * index, { duration: 1500 })
                                                  const event = navigation.emit({
                                                            type: 'tabPress',
                                                            target: route.key,
                                                            canPreventDefault: true,
                                                  });

                                                  if (!isFocused && !event.defaultPrevented) {
                                                            navigation.navigate(route.name, route.params);
                                                  }
                                        };

                                        const onLongPress = () => {
                                                  navigation.emit({
                                                            type: 'tabLongPress',
                                                            target: route.key,
                                                  });
                                        };

                                        return (
                                                  <TabBarButton
                                                            key={route.name}
                                                            onPress={onPress}
                                                            onLongPress={onLongPress}
                                                            isFocused={isFocused}
                                                            routeName={route.name}
                                                            color={isFocused ? '#673ab7' : '#222'}

                                                  />

                                        );
                              })}
                    </View>
          );
}


const styles = StyleSheet.create({
          tabBar: {
                    position: 'absolute',
                    bottom: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    marginHorizontal: 80,
                    justifyContent: 'space-between',
                    paddingVertical: 15,
                    borderRadius: 35,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,

          },

});

