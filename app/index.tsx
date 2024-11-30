import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Text,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../constants/theme";

export default function HomeScreen() {
  const faceAnim = useRef(new Animated.Value(0)).current;
  const tetrisAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

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

    // Pulsing play button animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Add this new background animation
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

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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

  const bgTransform = {
    transform: [
      {
        scale: bgAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              // Will add functionality later
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View
              style={{
                transform: [{ scale: Animated.multiply(pulseAnim, pressAnim) }],
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="play"
                size={40}
                color={CustomDarkTheme.colors.background}
                style={styles.playIcon}
              />
              <Text style={styles.buttonText}>play</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomDarkTheme.colors.background,
  },
  titleContainer: {
    position: "absolute",
    top: 60,
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
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: CustomDarkTheme.colors.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  playIcon: {
    marginRight: 12,
    color: CustomDarkTheme.colors.primary,
  },
  buttonText: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 40,
    color: CustomDarkTheme.colors.primary,
    letterSpacing: 1,
    textTransform: "lowercase",
  },
});
