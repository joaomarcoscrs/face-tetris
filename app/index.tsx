import { StyleSheet, ImageBackground, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { CustomDarkTheme } from "../constants/theme";
import AnimatedTitle from "./components/AnimatedTitle";
import AnimatedPlayButton from "./components/AnimatedPlayButton";
import { useCameraPermissions } from "expo-camera";

export default function HomeScreen() {
  const bgAnim = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Request camera permission on mount, if not granted
    if (!permission?.granted) {
      requestPermission();
    }

    // Background animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const bgTransform = {
    transform: [
      {
        scale: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.2],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, bgTransform]}>
      <ImageBackground
        source={require("../assets/images/visual-2048.png")}
        style={styles.container}
        resizeMode="contain"
      >
        <AnimatedTitle />
        <AnimatedPlayButton />
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomDarkTheme.colors.background,
  },
});
