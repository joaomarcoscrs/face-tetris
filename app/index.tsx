import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../constants/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            // Will add functionality later
          }}
        >
          <Ionicons
            name="play"
            size={48}
            color={CustomDarkTheme.colors.background}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CustomDarkTheme.colors.background,
  },
  buttonWrapper: {
    borderRadius: 60,
    padding: 3,
    backgroundColor: CustomDarkTheme.colors.secondary,
  },
  playButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: CustomDarkTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CustomDarkTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
