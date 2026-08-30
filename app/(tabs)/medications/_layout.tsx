import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function MedicationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
