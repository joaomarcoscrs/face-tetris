import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../constants/theme";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../assets/images/visual-2048.png")}
      style={styles.container}
      resizeMode="contain"
    >
      <View style={styles.titleContainer}>
        <View style={styles.titleWrapper}>
          <Text
            style={[styles.titleText, { color: CustomDarkTheme.colors.accent }]}
          >
            face
          </Text>
          <Text
            style={[
              styles.titleText,
              { color: CustomDarkTheme.colors.primary },
            ]}
          >
            tetris
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            // Will add functionality later
          }}
        >
          <Ionicons
            name="play"
            size={40}
            color={CustomDarkTheme.colors.background}
            style={styles.playIcon}
          />
          <Text style={styles.buttonText}>play</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
