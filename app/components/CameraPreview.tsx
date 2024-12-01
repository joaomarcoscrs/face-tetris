import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function CameraPreview() {
  const facing: CameraType = "front";
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission || !permission.granted) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  camera: {
    flex: 1,
  },
});
