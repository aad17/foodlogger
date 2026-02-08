import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteFoodLog } from '../../services/foodService';
import { useAuth } from '../../context/AuthContext';
import { FoodData } from '../../services/aiService';
import { format } from 'date-fns';

export default function LogDetailsScreen() {
    const { id, data } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // Parse data if available, otherwise we'd fetch (fetch logic omitted for brevity as we pass data)
    const log: FoodData | null = typeof data === 'string' ? JSON.parse(data) : null;

    const handleDelete = () => {
        Alert.alert(
            "Delete Log",
            "Are you sure you want to delete this log?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (user && typeof id === 'string') {
                            try {
                                await deleteFoodLog(user.uid, id);
                                router.back();
                            } catch (e) {
                                Alert.alert("Error", "Failed to delete log.");
                            }
                        }
                    }
                }
            ]
        );
    };

    if (!log) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: 'white' }}>Log not found</Text>
            </SafeAreaView>
        );
    }

    const { icon, color } = (() => {
        switch (log.category) {
            case 'Breakfast': return { icon: 'sunny', color: Colors.primaryYellow };
            case 'Lunch': return { icon: 'fast-food', color: Colors.actionOrange };
            case 'Dinner': return { icon: 'restaurant', color: Colors.secondaryPurple };
            case 'Snack': return { icon: 'cafe', color: Colors.tertiaryGreen };
            default: return { icon: 'nutrition', color: Colors.textSecondary };
        }
    })();

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: '#fff',
                headerBackTitle: '',
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    {log.imageUri ? (
                        <Image source={{ uri: log.imageUri }} style={styles.image} />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon as any} size={80} color={color} />
                        </View>
                    )}
                    <View style={styles.overlay} />
                </View>

                <View style={styles.content}>
                    {/* Header Info */}
                    <Text style={styles.foodName}>{log.foodName}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.tag, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon as any} size={14} color={color} style={{ marginRight: 4 }} />
                            <Text style={[styles.tagText, { color: color }]}>{log.category}</Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {/* Handle timestamp safely */}
                            {log.timestamp ? format(new Date(log.timestamp), 'MMM d, h:mm a') : ''}
                        </Text>
                    </View>

                    {/* Calories */}
                    <View style={styles.statCard}>
                        <Text style={styles.caloriesVal}>{log.calories}</Text>
                        <Text style={styles.caloriesLabel}>Calories</Text>
                    </View>

                    {/* Macros */}
                    <Text style={styles.sectionTitle}>Macros</Text>
                    <View style={styles.macrosRow}>
                        <MacroItem label="Protein" value={log.macros?.protein} color={Colors.secondaryPurple} />
                        <MacroItem label="Carbs" value={log.macros?.carbs} color={Colors.primaryYellow} />
                        <MacroItem label="Fat" value={log.macros?.fat} color={Colors.tertiaryGreen} />
                    </View>

                    {/* Micros */}
                    {log.micros && Object.keys(log.micros).length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Micronutrients</Text>
                            <View style={styles.microsGrid}>
                                {Object.entries(log.micros).map(([key, val], idx) => (
                                    <View key={idx} style={styles.microItem}>
                                        <Text style={styles.microLabel}>{key}</Text>
                                        <Text style={styles.microValue}>{val}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Actions */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                        <Text style={styles.deleteText}>Delete Log</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MacroItem({ label, value, color }: { label: string, value?: number, color: string }) {
    return (
        <View style={[styles.macroCard, { borderColor: color }]}>
            <Text style={[styles.macroVal, { color }]}>{Math.round(value || 0)}g</Text>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        marginTop: -30,
        backgroundColor: Colors.darkBackground,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        minHeight: 500,
    },
    foodName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 15,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        fontWeight: '600',
        fontSize: 14,
    },
    timestamp: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    statCard: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 25,
    },
    caloriesVal: {
        color: Colors.actionOrange,
        fontSize: 36,
        fontWeight: 'bold',
    },
    caloriesLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 10,
    },
    macroCard: {
        flex: 1,
        backgroundColor: Colors.darkSurface,
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        borderLeftWidth: 3,
    },
    macroVal: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    macroLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    microsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 30,
    },
    microItem: {
        backgroundColor: Colors.darkSurface,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: '45%',
    },
    microLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 2,
    },
    microValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 20,
        gap: 8,
    },
    deleteText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});
