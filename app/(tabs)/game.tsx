import { View, StyleSheet } from "react-native";
import { CustomDarkTheme } from "../../constants/theme";
import TetrisGame from "../components/TetrisGame";

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <TetrisGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomDarkTheme.colors.background,
  },
});
