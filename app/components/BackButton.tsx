import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../../constants/theme";
import { router } from "expo-router";

interface Props {
  onPress?: () => void;
}

export default function BackButton({ onPress }: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="arrow-undo"
        size={20}
        color={CustomDarkTheme.colors.primary}
      />
      <Text style={styles.backButtonText}>back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    top: 80,
    left: 20,
    zIndex: 999,
  },
  backButtonText: {
    color: CustomDarkTheme.colors.secondary,
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 18,
  },
});
