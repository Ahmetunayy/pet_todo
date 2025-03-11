import { View, Platform, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarButton } from './TabBarButton';
import { useEffect, useState } from 'react';
import Animated, {
          useAnimatedStyle,
          useSharedValue,
          withSpring,
          runOnJS
} from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
          const { colors } = useTheme();
          const { buildHref } = useLinkBuilder();

          const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
          const buttonWidth = dimensions.width / state.routes.length;

          // Animation shared values
          const tabPositionX = useSharedValue(0);

          // Set initial position and update when index changes
          useEffect(() => {
                    if (buttonWidth > 0) {
                              tabPositionX.value = withSpring(buttonWidth * state.index, {
                                        mass: 1,
                                        damping: 20,
                                        stiffness: 200,
                              });
                    }
          }, [state.index, buttonWidth]);

          const onTabbarLayout = (event: LayoutChangeEvent) => {
                    const { width, height } = event.nativeEvent.layout;
                    setDimensions({ width, height });

                    // Set initial position after layout
                    if (width > 0) {
                              tabPositionX.value = width / state.routes.length * state.index;
                    }
          };

          // Animated styles for the indicator
          const animatedStyle = useAnimatedStyle(() => {
                    return {
                              transform: [{ translateX: tabPositionX.value }]
                    };
          });

          return (
                    <View onLayout={onTabbarLayout} style={styles.tabBar}>
                              {dimensions.width > 0 && (
                                        <Animated.View
                                                  style={[
                                                            styles.activeIndicator,
                                                            animatedStyle,
                                                            {
                                                                      width: buttonWidth - 20,
                                                                      height: dimensions.height - 15,
                                                            }
                                                  ]}
                                        />
                              )}
                              {state.routes.map((route, index) => {
                                        const { options } = descriptors[route.key];
                                        const label =
                                                  options.tabBarLabel !== undefined
                                                            ? options.tabBarLabel
                                                            : options.title !== undefined
                                                                      ? options.title
                                                                      : route.name;

                                        const isFocused = state.index === index;

                                        const onPress = (e: any) => {
                                                  const event = navigation.emit({
                                                            type: 'tabPress',
                                                            target: route.key,
                                                            canPreventDefault: true,
                                                  });

                                                  if (!isFocused && !event.defaultPrevented) {
                                                            navigation.navigate(route.name, route.params);
                                                  }
                                        };

                                        const onLongPress = (e: any) => {
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
                                                            color={isFocused ? '#723FEB' : '#222'}
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
                    marginHorizontal: 10,
                    justifyContent: 'space-between',
                    paddingVertical: 15,
                    borderRadius: 35,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 5,
          },
          activeIndicator: {
                    position: 'absolute',
                    backgroundColor: '#723FEB',
                    opacity: 0.25,
                    borderRadius: 40,
                    left: 10,
          }
});

