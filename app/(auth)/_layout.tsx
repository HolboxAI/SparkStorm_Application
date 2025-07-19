import { useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function RootChatLayout() {
  const { isSignedIn } = useUser();
  console.log("RootChatLayout isSignedIn:", isSignedIn);
  

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
