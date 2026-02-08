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
import LogCard from '../../components/LogCard';

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
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Logs</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {dailyLogs.length === 0 ? (
                        <Text style={styles.emptyText}>No meals logged yet today.</Text>
                    ) : (
                        dailyLogs.map((log, index) => (
                            <LogCard key={index} log={log} />
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllText: {
        color: Colors.actionOrange,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 10,
    },
});
