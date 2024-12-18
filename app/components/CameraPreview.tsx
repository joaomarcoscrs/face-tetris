import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { interval } from "rxjs";
import { switchMap, catchError, filter } from "rxjs/operators";
import axios from "axios";
import { CustomDarkTheme } from "../../constants/theme";
import {
  gameActionSubject,
  mapFaceDirectionToGameAction,
} from "../utils/gameControls";

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const URL =
  //   "https://joaomarcos-inference.ngrok.app/facial-features-3xkvb/2"; // model URL
  "https://joaomarcos-inference.ngrok.app/infer/workflows/joao-marcos-3cjqf/tetris-controller";
const CAPTURE_INTERVAL = 100;

interface BlockResponse {
  data?: {
    outputs?: [
      {
        action: string;
        yaw: number[];
        pitch: number[];
      }
    ];
  };
}

export default function CameraPreview() {
  const facing: CameraType = "front";
  const [permission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isCapturing = useRef(false);
  const [latency, setLatency] = useState<number | null>(null);

  const calculateIntensity = (yaw: number[], threshold: number): number => {
    if (!yaw?.length) return 1;
    const angle = Math.abs(yaw[0]);
    if (angle <= threshold) return 1;
    // Calculate how much we exceed the threshold, normalized
    return Math.floor(Math.min((angle - threshold) / threshold + 1, 3));
  };

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
              quality: 0.2,
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
              url: URL,
              data: {
                api_key: ROBOFLOW_API_KEY,
                inputs: {
                  image: { type: "base64", value: photo.base64 },
                },
              },
              headers: {
                "Content-Type": "application/json",
              },
            });

            const requestTime = Date.now() - startTime;

            setLatency(requestTime);

            const handleResponse = (response: BlockResponse) => {
              const action = response.data?.outputs?.[0]?.action;
              const yaw = response.data?.outputs?.[0]?.yaw;

              if (action) {
                // Calculate intensity only for left/right movements
                const intensity =
                  action === "looking_left" || action === "looking_right"
                    ? calculateIntensity(yaw || [], 7) // 20 degrees threshold, adjust as needed
                    : 1;

                // Map and emit game action if valid
                const gameAction = mapFaceDirectionToGameAction({
                  action,
                  intensity,
                });

                if (gameAction) {
                  if (gameAction.action !== "softDrop") {
                    gameActionSubject.next({
                      action: "endSoftDrop",
                      intensity: 1,
                    });
                  }
                  gameActionSubject.next(gameAction);
                }
              }
            };

            handleResponse(response);

            console.log(`response.data: ${JSON.stringify(response.data)}`);

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
