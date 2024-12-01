import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { interval } from "rxjs";
import { switchMap, catchError, filter } from "rxjs/operators";
import axios from "axios";

const API_KEY = "YOUR_KEY";
const MODEL_URL = "https://detect.roboflow.com/your-model/42";
const CAPTURE_INTERVAL = 100;

export default function CameraPreview() {
  const facing: CameraType = "front";
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isCapturing = useRef(false);

  useEffect(() => {
    if (!permission?.granted || !isCameraReady) return;

    const subscription = interval(CAPTURE_INTERVAL)
      .pipe(
        filter(() => !isCapturing.current),
        switchMap(async () => {
          if (!cameraRef.current) return null;

          try {
            isCapturing.current = true;
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.1,
              base64: true,
              shutterSound: false,
              skipProcessing: true,
            });

            if (!photo?.base64) {
              console.error("Failed to capture image: No base64 data");
              return null;
            }

            const startTime = Date.now();

            const response = await axios({
              method: "POST",
              url: MODEL_URL,
              params: {
                api_key: API_KEY,
              },
              data: photo.base64,
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            });

            const requestTime = Date.now() - startTime;
            console.log(`Request time: ${requestTime}ms`);
            console.log(
              `Predictions count: ${response.data.predictions.length}`
            );

            return response.data;
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(
                `API Error: ${error.response?.status} - ${error.message}`
              );
            } else {
              console.error("Camera Error:", error);
            }
            return null;
          } finally {
            isCapturing.current = false;
          }
        }),
        catchError((error) => {
          console.error("Stream error:", error);
          isCapturing.current = false;
          return interval(CAPTURE_INTERVAL);
        })
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      isCapturing.current = false;
    };
  }, [permission?.granted, isCameraReady]);

  if (!permission || !permission.granted) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        animateShutter={false}
        onCameraReady={() => setIsCameraReady(true)}
      />
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
