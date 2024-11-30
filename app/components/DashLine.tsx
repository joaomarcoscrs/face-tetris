import React from "react";
import { View, StyleSheet } from "react-native";
import { BOARD_WIDTH, BLOCK_SIZE } from "../constants/tetris";
import { CustomDarkTheme } from "../../constants/theme";

export default function DashLine() {
  const dashCount = BOARD_WIDTH * 4; // Double the board width for smaller dashes
  const dashWidth = (BOARD_WIDTH * BLOCK_SIZE) / dashCount;

  return (
    <View style={styles.container}>
      {Array(dashCount)
        .fill(null)
        .map((_, index) => (
          <View
            key={index}
            style={[
              styles.dash,
              {
                width: dashWidth,
                left: index * dashWidth,
                opacity: index % 2 === 0 ? 1 : 0,
              },
            ]}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: BOARD_WIDTH * BLOCK_SIZE,
    height: 2,
    flexDirection: "row",
  },
  dash: {
    position: "absolute",
    height: "100%",
    backgroundColor: CustomDarkTheme.colors.text,
  },
});
