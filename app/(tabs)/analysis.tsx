import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getWeeklyLogs } from '../../services/foodService';
import { FoodData } from '../../services/aiService';
import CalorieTrendChart from '../../components/CalorieTrendChart';
import MacroPieChart from '../../components/MacroPieChart';
import MicrosSummary from '../../components/MicrosSummary';

export default function AnalysisScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [weeklyLogs, setWeeklyLogs] = useState<FoodData[]>([]);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const logs = await getWeeklyLogs(user.uid);
            setWeeklyLogs(logs);
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

    // --- Data Processing for Charts ---

    // 1. Weekly Calories Trend
    const processCalorieTrend = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];

            // Filter logs for this day
            const dayLogs = weeklyLogs.filter(log => {
                // Approximate date match ignoring time zone issues for simplicity in this demo
                // Ideally use date-fns isSameDay
                return log.timestamp.startsWith(dateStr);
            });

            const calories = dayLogs.reduce((sum, log) => sum + log.calories, 0);
            return { day: dayName, calories };
        });
    };

    // 2. Average Macros
    const processMacros = () => {
        const total = weeklyLogs.reduce(
            (acc, log) => ({
                protein: acc.protein + (log.macros?.protein || 0),
                carbs: acc.carbs + (log.macros?.carbs || 0),
                fat: acc.fat + (log.macros?.fat || 0),
            }),
            { protein: 0, carbs: 0, fat: 0 }
        );
        return total;
    };

    // 3. Aggregate Micros (Just picking last known distinct values or summing? 
    // Usually micros are daily targets, but for summary let's show what was found recently)
    const processMicros = () => {
        const micros: { [key: string]: string | number } = {};
        weeklyLogs.forEach(log => {
            if (log.micros) {
                Object.entries(log.micros).forEach(([key, val]) => {
                    // For demo, just overwriting to show latest values found for that nutrient
                    // Or we could count occurrences? Let's just list unique ones found.
                    if (!micros[key]) {
                        micros[key] = val;
                    }
                });
            }
        });
        return micros;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryYellow} />}
            >
                <Text style={styles.headerTitle}>Analysis</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primaryYellow} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <CalorieTrendChart weeklyData={processCalorieTrend()} goal={2500} />

                        <MacroPieChart macros={processMacros()} />

                        <MicrosSummary micros={processMicros()} />
                    </>
                )}
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
        padding: 20,
        paddingBottom: 100,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
});
