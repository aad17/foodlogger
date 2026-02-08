import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getDailyLogs } from '../../services/foodService';
import { FoodData } from '../../services/aiService';

import DateSelector from '../../components/DateSelector';
import CalorieHero from '../../components/CalorieHero';
import MacroGrid from '../../components/MacroGrid';
import { format } from 'date-fns';

export default function Dashboard() {
    const { user } = useAuth();
    const [dailyLogs, setDailyLogs] = useState<FoodData[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Unused for now but kept for logic
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const logs = await getDailyLogs(user.uid);
            setDailyLogs(logs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const caloriesConsumed = dailyLogs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = dailyLogs.reduce((acc, log) => acc + (log.macros?.protein || 0), 0);
    const totalCarbs = dailyLogs.reduce((acc, log) => acc + (log.macros?.carbs || 0), 0);
    const totalFat = dailyLogs.reduce((acc, log) => acc + (log.macros?.fat || 0), 0);

    // Hardcoded for now, move to user profile later
    const CALORIE_GOAL = 2500;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryYellow} />}
            >
                {/* 1. Date Selector */}
                <DateSelector />

                {/* 2. Hero Section (Calories) */}
                <CalorieHero
                    caloriesConsumed={caloriesConsumed}
                    calorieGoal={CALORIE_GOAL}
                />

                {/* 3. Macros Grid */}
                <MacroGrid
                    protein={Math.round(totalProtein)}
                    carbs={Math.round(totalCarbs)}
                    fat={Math.round(totalFat)}
                />

                {/* 4. Recent Logs List */}
                <View style={styles.logsSection}>
                    <Text style={styles.sectionTitle}>Recent Logs</Text>
                    {dailyLogs.length === 0 ? (
                        <Text style={styles.emptyText}>No meals logged yet today.</Text>
                    ) : (
                        dailyLogs.map((log, index) => (
                            <View key={index} style={styles.logItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logFoodName} numberOfLines={1}>{log.foodName}</Text>
                                    <View style={styles.logMetaRow}>
                                        <Text style={styles.logTime}>
                                            {log.timestamp ? (
                                                // Handle Firestore Timestamp vs Date
                                                // @ts-ignore
                                                log.timestamp.toDate ? format(log.timestamp.toDate(), 'HH:mm') : format(new Date(log.timestamp), 'HH:mm')
                                            ) : ''}
                                        </Text>
                                        <Text style={styles.logCategory}> • {log.category || 'Meal'}</Text>
                                    </View>
                                </View>
                                <Text style={styles.logCalories}>{log.calories} kcal</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Dev Button Area */}
                <View style={{ paddingBottom: 40, paddingHorizontal: 20 }}>
                    <TouchableOpacity
                        style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center' }}
                        onPress={() => {
                            console.log('Dev button pressed');
                        }}
                    >
                        <Text style={{ color: '#888', fontSize: 12 }}>[Dev] Test UI Layout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
    },
    scrollContent: {
        paddingBottom: 100, // Space for Tab Bar
    },
    logsSection: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 10,
    },
    logItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
    },
    logFoodName: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    logMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logTime: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    logCategory: {
        color: Colors.textSecondary,
        fontSize: 12,
        textTransform: 'capitalize',
    },
    logCalories: {
        color: Colors.primaryYellow,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
