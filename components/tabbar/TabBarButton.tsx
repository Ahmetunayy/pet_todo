import { icon } from "@/constants/icon";
import { useEffect } from "react";
import { Pressable, StyleSheet, GestureResponderEvent } from "react-native";
import Animated, {
          interpolate,
          useAnimatedStyle,
          useSharedValue,
          withSpring,
          withTiming
} from "react-native-reanimated";

type TabBarButtonProps = {
          onPress: (event: GestureResponderEvent) => void;
          onLongPress: (event: GestureResponderEvent) => void;
          isFocused: boolean;
          routeName: string;
          color: string;
}

export function TabBarButton({ onPress, onLongPress, isFocused, routeName, color }: TabBarButtonProps) {
          const scale = useSharedValue(0);

          // Update animation when focus changes
          useEffect(() => {
                    scale.value = withSpring(isFocused ? 1 : 0, {
                              damping: 15,
                              stiffness: 200,
                              mass: 1
                    });
          }, [isFocused]);

          const animatedIconStyle = useAnimatedStyle(() => {
                    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
                    const top = interpolate(scale.value, [0, 1], [0, -5]);

                    return {
                              transform: [{ scale: scaleValue }],
                              top: top
                    };
          });

          return (
                    <Pressable
                              onPress={onPress}
                              onLongPress={onLongPress}
                              style={styles.tabBarItem}
                    >
                              <Animated.View style={animatedIconStyle}>
                                        {icon[routeName as keyof typeof icon]({
                                                  color: isFocused ? '#723FEB' : '#222'
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
                    height: 40,
          },
});