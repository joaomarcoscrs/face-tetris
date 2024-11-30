import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { CustomDarkTheme } from "../../constants/theme";

export default function AnimatedTitle() {
  const faceAnim = useRef(new Animated.Value(0)).current;
  const tetrisAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animations for both words
    Animated.loop(
      Animated.sequence([
        Animated.timing(faceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(faceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start tetris animation with a delay and different duration
    Animated.loop(
      Animated.sequence([
        Animated.timing(tetrisAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(tetrisAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const faceTransform = {
    transform: [
      {
        translateY: faceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
      {
        rotate: faceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "2deg"],
        }),
      },
    ],
  };

  const tetrisTransform = {
    transform: [
      {
        translateY: tetrisAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        }),
      },
      {
        rotate: tetrisAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-2deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleWrapper}>
        <Animated.Text
          style={[
            styles.titleText,
            { color: CustomDarkTheme.colors.accent },
            faceTransform,
          ]}
        >
          face
        </Animated.Text>
        <Animated.Text
          style={[
            styles.titleText,
            { color: CustomDarkTheme.colors.error },
            tetrisTransform,
          ]}
        >
          tetris
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  titleWrapper: {
    flexDirection: "row",
  },
  titleText: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 48,
    letterSpacing: 2,
    textTransform: "lowercase",
  },
});
