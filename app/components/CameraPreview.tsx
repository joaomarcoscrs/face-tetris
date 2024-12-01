import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { interval } from "rxjs";
import { switchMap, catchError, filter } from "rxjs/operators";
import axios from "axios";
import { ROBOFLOW_API_KEY } from "@env";
import { CustomDarkTheme } from "../../constants/theme";

const MODEL_URL =
  "https://joaomarcos-inference.ngrok.app/facial-features-3xkvb/2";
const CAPTURE_INTERVAL = 100;

export default function CameraPreview() {
  const facing: CameraType = "front";
  const [permission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isCapturing = useRef(false);
  const [latency, setLatency] = useState<number | null>(null);

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
                api_key: ROBOFLOW_API_KEY,
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

            setLatency(requestTime);

            return response.data;
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(
                `API Error: ${error.response?.status} - ${error.message}. Request made using API key: ${ROBOFLOW_API_KEY}`
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
      {latency !== null && (
        <View style={styles.latencyContainer}>
          <Text style={styles.latencyText}>Latency: {latency}ms</Text>
        </View>
      )}
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
  latencyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 2,
  },
  latencyText: {
    color: CustomDarkTheme.colors.primary,
    fontSize: 10,
  },
});
