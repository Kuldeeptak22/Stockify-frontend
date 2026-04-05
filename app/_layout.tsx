import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import "../global.css";

export default function Rootlayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="add-product" options={{ headerShown: false }} />
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}
