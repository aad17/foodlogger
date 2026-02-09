import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteFoodLog, updateFoodLog } from '../../services/foodService';
import { useAuth } from '../../context/AuthContext';
import { FoodData } from '../../services/aiService';
import { format } from 'date-fns';
import { useState } from 'react';

export default function LogDetailsScreen() {
    const { id, data } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    // Initialize state with passed data
    const [log, setLog] = useState<FoodData | null>(() => {
        if (typeof data === 'string') {
            const parsed = JSON.parse(data);
            // Ensure defaults
            return {
                ...parsed,
                quantity: parsed.quantity || 1,
                healthScore: parsed.healthScore || 50 // Default if missing
            };
        }
        return null;
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editQuantity, setEditQuantity] = useState(log?.quantity || 1);

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

    const handleSaveQuantity = async () => {
        if (!log || !user || typeof id !== 'string') return;

        // Calculate new values
        const oldQty = log.quantity || 1;
        const newQty = editQuantity;
        const ratio = newQty / oldQty;

        const newCalories = Math.round(log.calories * ratio);
        const newMacros = {
            protein: Math.round(log.macros.protein * ratio),
            carbs: Math.round(log.macros.carbs * ratio),
            fat: Math.round(log.macros.fat * ratio),
        };

        const updates = {
            quantity: newQty,
            calories: newCalories,
            macros: newMacros
        };

        try {
            await updateFoodLog(user.uid, id, updates);

            // Update local state
            setLog({
                ...log,
                ...updates
            });
            setShowEditModal(false);
            Alert.alert("Success", "Log updated successfully.");
        } catch (e) {
            Alert.alert("Error", "Failed to update log.");
        }
    };

    const changeEditQty = (delta: number) => {
        setEditQuantity(prev => Math.max(0.5, prev + delta));
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
            case 'Morning Snack':
            case 'Evening Snack': return { icon: 'cafe', color: Colors.tertiaryGreen };
            default: return { icon: 'nutrition', color: Colors.textSecondary };
        }
    })();

    const getHealthColor = (score: number) => {
        if (score >= 80) return Colors.tertiaryGreen;
        if (score >= 50) return Colors.primaryYellow;
        return Colors.actionOrange;
    };
    const healthColor = getHealthColor(log.healthScore);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: '#fff',
                headerBackTitle: '',
                headerRight: () => (
                    <TouchableOpacity onPress={() => { setEditQuantity(log.quantity); setShowEditModal(true); }} style={{ marginRight: 10 }}>
                        <Ionicons name="pencil" size={24} color={Colors.actionOrange} />
                    </TouchableOpacity>
                )
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

                    {/* Quantity Display */}
                    <View style={styles.qtyRow}>
                        <Text style={styles.qtyLabel}>Quantity: </Text>
                        <Text style={styles.qtyValue}>{log.quantity} serving(s)</Text>
                    </View>

                    {/* Health Score */}
                    {log.healthScore !== undefined && (
                        <View style={styles.healthCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <Ionicons name="flash" size={16} color={Colors.textSecondary} />
                                <Text style={styles.healthTitle}>Health score: {log.healthScore}%</Text>
                            </View>
                            <View style={styles.healthBarBg}>
                                <View style={[styles.healthBarFill, { width: `${log.healthScore}%`, backgroundColor: healthColor }]} />
                            </View>
                            {log.healthScoreReason && (
                                <Text style={styles.healthReason}>{log.healthScoreReason}</Text>
                            )}
                        </View>
                    )}

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

                {/* Edit Modal */}
                <Modal
                    visible={showEditModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowEditModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Quantity</Text>

                            <View style={styles.editQtyContainer}>
                                <TouchableOpacity onPress={() => changeEditQty(-0.5)} style={styles.qtyBtn}>
                                    <Ionicons name="remove" size={24} color={Colors.textPrimary} />
                                </TouchableOpacity>
                                <Text style={styles.editQtyValue}>{editQuantity}</Text>
                                <TouchableOpacity onPress={() => changeEditQty(0.5)} style={styles.qtyBtn}>
                                    <Ionicons name="add" size={24} color={Colors.textPrimary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.editHint}>Calories and macros will be scaled.</Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtnSec} onPress={() => setShowEditModal(false)}>
                                    <Text style={styles.modalBtnTextSec}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalBtnPri} onPress={handleSaveQuantity}>
                                    <Text style={styles.modalBtnTextPri}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        marginBottom: 15,
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
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    qtyLabel: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    qtyValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
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
    healthCard: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    healthTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    healthBarBg: {
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        marginVertical: 10,
    },
    healthBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    healthReason: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: Colors.darkSurface,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    editQtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 10,
    },
    qtyBtn: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
    },
    editQtyValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    editHint: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    modalBtnSec: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    modalBtnPri: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: Colors.actionOrange,
        alignItems: 'center',
    },
    modalBtnTextSec: {
        color: '#fff',
        fontWeight: '600',
    },
    modalBtnTextPri: {
        color: '#fff',
        fontWeight: '600',
    },
});
