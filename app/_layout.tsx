import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ 
      title: '', 
      contentStyle: { 
        backgroundColor: 'white', 
      }, 
      headerShadowVisible: false, 
    }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='new' />
    </Stack>
  );
}
