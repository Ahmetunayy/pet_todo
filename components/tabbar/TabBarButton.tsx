import { icon } from "@/constants/icon";
import { useEffect } from "react";
import { Pressable, StyleSheet, Animated } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function TabBarButton({ onPress, onLongPress, isFocused, routeName, color }: { onPress: Function, onLongPress: Function, isFocused: boolean, routeName: string, color: string }) {
          const scale = useSharedValue(0);
          useEffect(() => {
                    scale.value = withSpring(typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused, { duration: 350 })
          }, [scale, isFocused])
          const animatedIconStyle = useAnimatedStyle(() => {
                    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])
                    const top = interpolate(scale.value, [0, 1], [0, 9])
                    return {
                              transform: [{ scale: scaleValue }],
                              top: top
                    }
          })
          return (
                    <Pressable
                              onPress={onPress}
                              onLongPress={onLongPress}
                              style={styles.tabBarItem}
                    >
                              <Animated.View style={animatedIconStyle}>
                                        {icon[routeName as keyof typeof icon]({
                                                  color: isFocused ? '#673ab7' : '#222'
                                        })}
                              </Animated.View>

                    </Pressable>
          )
}

const styles = StyleSheet.create({
          tabBarItem: {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
          },
});