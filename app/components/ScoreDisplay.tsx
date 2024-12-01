import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomDarkTheme } from "../../constants/theme";

interface Props {
  score: number;
}

export default function ScoreDisplay({ score }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>score</Text>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  label: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 14,
    color: CustomDarkTheme.colors.secondary,
    opacity: 0.7,
    textTransform: "lowercase",
  },
  score: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 24,
    color: CustomDarkTheme.colors.secondary,
    textTransform: "lowercase",
  },
});
