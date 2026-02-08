
import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        // Load custom fonts if needed, for now we let it default or load later
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || true) { // Force true for now until real fonts
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded && false) {
        return null;
    }

    return (
        <AuthProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                </Stack>
            </View>
        </AuthProvider>
    );
}
