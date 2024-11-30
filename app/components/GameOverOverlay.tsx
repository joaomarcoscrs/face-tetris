import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { CustomDarkTheme } from "../../constants/theme";
import { useRouter } from "expo-router";

export default function GameOverOverlay() {
  const router = useRouter();
  const opacity = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Navigate back after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.overlay} />
      <Text style={styles.text}>game over 💀</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CustomDarkTheme.colors.background,
    opacity: 0.8,
  },
  text: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 48,
    color: CustomDarkTheme.colors.error,
    textTransform: "lowercase",
  },
});
