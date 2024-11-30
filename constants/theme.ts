import { DarkTheme } from "@react-navigation/native";

const colors = {
  blue: "#42BFBA",
  lightBlue: "#8FD4D1",
  yellow: "#FDCB5C",
  red: "#FB5463",
  black: "#0F0C0E",
  white: "#FFFFFF",
  lessBlack: "#1A1618",
  lessLessBlack: "#2A2628",
};

export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.black,
    primary: colors.blue,
    secondary: colors.lightBlue,
    accent: colors.yellow,
    error: colors.red,
    text: colors.white,
    card: colors.lessBlack,
    border: colors.lessLessBlack,
  },
};
