import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error("Error signing out: ", error);
                            Alert.alert("Error", "Failed to log out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>User</Text>
                                <Text style={styles.profileEmail}>{user?.email}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Settings Section (Placeholder for now) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.settingRow}>
                            <View style={styles.settingIconContainer}>
                                <Ionicons name="moon" size={20} color={Colors.primaryYellow} />
                            </View>
                            <Text style={styles.settingText}>Appearance</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <TouchableOpacity style={styles.settingRow}>
                            <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(155, 197, 61, 0.1)' }]}>
                                <Ionicons name="notifications" size={20} color={Colors.tertiaryGreen} />
                            </View>
                            <Text style={styles.settingText}>Notifications</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.actionOrange} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 12,
        overflow: 'hidden',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primaryYellow,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.darkBackground,
    },
    profileInfo: {
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    settingIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(244, 211, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border,
        marginLeft: 62,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    logoutText: {
        color: Colors.actionOrange,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    versionText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 10,
        marginBottom: 30,
    }
});
