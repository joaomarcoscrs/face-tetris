import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  View,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

export default function AnimatedPlayButton() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const playRotateAnim = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Pulsing play button animation
    Animated.loop(
      Animated.parallel([
        // Scale animation
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        // Rotation animation
        Animated.sequence([
          Animated.timing(playRotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(playRotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
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

  const requestCameraPermission = async () => {
    if (!permission || !permission.granted) {
      await requestPermission();
    }

    if (permission?.granted) {
      router.push({
        pathname: "/(tabs)/game",
        params: { useFacialControls: "true" },
      });
    } else {
      // If denied, just start the game without facial controls
      router.push({
        pathname: "/(tabs)/game",
        params: { useFacialControls: "false" },
      });
    }
  };

  const handlePress = async () => {
    await requestCameraPermission();
  };

  const playButtonTransform = {
    transform: [
      { scale: Animated.multiply(pulseAnim, pressAnim) },
      {
        rotate: playRotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-3deg", "3deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.playButtonContent, playButtonTransform]}>
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
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 120,
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
  playButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
