import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, Text, StyleSheet } from "react-native";

interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}

export function TabItem({ label, icon, active, onPress }: TabItemProps) {
  const scale = useRef(new Animated.Value(active ? 1.1 : 1)).current;
  const translateY = useRef(new Animated.Value(active ? -6 : 0)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 1.1 : 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: active ? -6 : 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active]);

  return (
    <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
        }}
      >
        {icon}
      </Animated.View>

      {/* Label só aparece quando ativo */}
      <Animated.Text
        style={[
          styles.label,
          {
            opacity,
            transform: [
              {
                translateY: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 0],
                }),
              },
            ],
          },
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
