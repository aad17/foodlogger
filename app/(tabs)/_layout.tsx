import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primaryYellow,
                tabBarInactiveTintColor: Colors.textSecondary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="plan"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.scanButton}>
                            <Ionicons name="scan" size={24} color="#fff" />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // e.preventDefault(); // If we want to open a modal instead
                        // navigation.navigate('scan-modal');
                    }
                })}

            />
            <Tabs.Screen
                name="analysis"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.darkBackground,
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 85 : 60,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        paddingTop: 10,
    },
    scanButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.actionOrange,
        justifyContent: 'center',
        alignItems: 'center',
        top: -15, // Float above
        shadowColor: Colors.actionOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
