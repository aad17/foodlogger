import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getDailyLogs } from '../../services/foodService';
import { UserProfile, getUserProfile } from '../../services/userService';
import { FoodData } from '../../services/aiService';
import { format } from 'date-fns';

import DateSelector from '../../components/DateSelector';
import CalorieHero from '../../components/CalorieHero';
import MacroGrid from '../../components/MacroGrid';
import LogCard from '../../components/LogCard';

import { Link, useRouter, useFocusEffect } from 'expo-router';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailyLogs, setDailyLogs] = useState<FoodData[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Unused for now but kept for logic
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const logs = await getDailyLogs(user.uid, selectedDate);
            setDailyLogs(logs);

            // Fetch profile for targets
            const userProfile = await getUserProfile(user.uid);
            setProfile(userProfile);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user, selectedDate]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const caloriesConsumed = dailyLogs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = dailyLogs.reduce((acc, log) => acc + (log.macros?.protein || 0), 0);
    const totalCarbs = dailyLogs.reduce((acc, log) => acc + (log.macros?.carbs || 0), 0);
    const totalFat = dailyLogs.reduce((acc, log) => acc + (log.macros?.fat || 0), 0);

    // Use profile targets or defaults
    const CALORIE_GOAL = profile?.targets?.calories || 2000;
    const PROTEIN_GOAL = profile?.targets?.protein || 150;
    const CARBS_GOAL = profile?.targets?.carbs || 200;
    const FAT_GOAL = profile?.targets?.fat || 65;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryYellow} />}
            >
                {/* 1. Date Selector */}
                <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

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
                    proteinTarget={PROTEIN_GOAL}
                    carbsTarget={CARBS_GOAL}
                    fatTarget={FAT_GOAL}
                />

                {/* 4. Categorized Logs */}
                <View style={styles.logsSection}>
                    <Text style={styles.dateTitle}>
                        {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
                    </Text>

                    {['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'].map((category) => {
                        const categoryLogs = dailyLogs.filter(log => log.category === category);

                        // Optional: Hide empty sections or show all? 
                        // Let's show all sections to encourage logging, but maybe compact if empty.
                        // For now, let's only render sections that have logs OR always render main meals?
                        // User said "segregate logs... into these categories". 
                        // Let's render the header and then the logs.

                        return (
                            <View key={category} style={styles.categorySection}>
                                <Text style={styles.categoryHeader}>{category}</Text>
                                {categoryLogs.length > 0 ? (
                                    categoryLogs.map((log, index) => (
                                        <Link
                                            key={index}
                                            href={{
                                                pathname: "/log/[id]",
                                                params: { id: log.id, data: JSON.stringify(log) }
                                            }}
                                            asChild
                                        >
                                            <TouchableOpacity>
                                                <LogCard log={log} />
                                            </TouchableOpacity>
                                        </Link>
                                    ))
                                ) : (
                                    <View style={styles.emptyCategoryPlaceholder}>
                                        <Text style={styles.emptyCategoryText}>No {category} logged</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
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
    dateTitle: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    categorySection: {
        marginBottom: 25,
    },
    categoryHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyCategoryPlaceholder: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    emptyCategoryText: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
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
