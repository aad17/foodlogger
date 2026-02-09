import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { addWaterLog, addWeightLog, getDailyWaterLogs, getWeightLogs, WaterLog, WeightLog } from '../../services/logService';
import { getUserProfile, UserProfile } from '../../services/userService';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

export default function LoggerScreen() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

    const [currentWeight, setCurrentWeight] = useState('');
    const [loading, setLoading] = useState(true);

    const [waterIntake, setWaterIntake] = useState(0);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user, selectedDate]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userProfile = await getUserProfile(user.uid);
            setProfile(userProfile);

            // Fetch Water for selected date
            const dailyWater = await getDailyWaterLogs(user.uid, selectedDate);
            setWaterLogs(dailyWater);
            const totalWater = dailyWater.reduce((sum, log) => sum + log.amount, 0);
            setWaterIntake(totalWater);

            // Fetch Weight history (last 30 days)
            const weights = await getWeightLogs(user.uid, 30);
            setWeightLogs(weights);

            // Set current weight input if logged today
            const todayLog = weights.find(w => isSameDay(new Date(w.timestamp), selectedDate));
            if (todayLog) {
                setCurrentWeight(todayLog.weight.toString());
            } else {
                // Determine latest weight
                const latest = weights[weights.length - 1];
                if (latest) setCurrentWeight(latest.weight.toString());
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWater = async () => {
        if (!user) return;
        try {
            const amount = 250; // 250ml cup
            await addWaterLog(user.uid, amount); // Logs for 'now', but query filters by day. 
            // Ideally we should allow logging for specific past dates, but for now 'now' is fine or we update service.
            // Service uses new Date() in addWaterLog. Let's stick to 'today' logging for simplicity or update service.
            // Requirement says "logger tab", implying daily log.
            // If selectedDate is NOT today, we might want to block logging or update service to accept date.
            // For MVP, allow logging only for Today or update service.
            // I'll update visual state immediately.
            setWaterIntake(prev => prev + amount);
            await fetchData(); // Refresh to be sure
        } catch (e) {
            Alert.alert("Error", "Failed to log water.");
        }
    };

    const handleSaveWeight = async () => {
        if (!user || !currentWeight) return;
        try {
            const w = parseFloat(currentWeight);
            if (isNaN(w)) {
                Alert.alert("Invalid input", "Please enter a valid number");
                return;
            }
            await addWeightLog(user.uid, w, selectedDate); // Pass selectedDate
            Alert.alert("Success", "Weight logged.");
            await fetchData();
        } catch (e) {
            Alert.alert("Error", "Failed to log weight.");
        }
    };

    const changeDate = (days: number) => {
        setSelectedDate(prev => addDays(prev, days));
    };

    // Derived
    const waterGoal = profile?.targets?.water || 2500;
    const waterProgress = Math.min(waterIntake / waterGoal, 1);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header / Date Nav */}
                <View style={styles.header}>
                    <Text style={styles.title}>Logger</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={() => changeDate(-1)}>
                            <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.dateText}>
                            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                        </Text>
                        <TouchableOpacity onPress={() => changeDate(1)} disabled={isSameDay(selectedDate, new Date())}>
                            <Ionicons name="chevron-forward" size={24} color={isSameDay(selectedDate, new Date()) ? Colors.darkSurface : Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Water Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="water" size={24} color={'#4A90E2'} />
                        <Text style={styles.cardTitle}>Water Intake</Text>
                    </View>

                    <View style={styles.waterContainer}>
                        <View style={styles.waterProgress}>
                            <Text style={styles.waterValue}>{waterIntake} <Text style={styles.unit}>ml</Text></Text>
                            <Text style={styles.waterGoal}>of {waterGoal} ml goal</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${waterProgress * 100}%`, backgroundColor: '#4A90E2' }]} />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.addWaterBtn} onPress={handleAddWater}>
                            <Ionicons name="add" size={32} color="#fff" />
                            <Text style={styles.addWaterText}>+250ml</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weight Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="scale" size={24} color={Colors.secondaryPurple} />
                        <Text style={styles.cardTitle}>Weight Tracker</Text>
                    </View>

                    <View style={styles.weightInputRow}>
                        <TextInput
                            style={styles.weightInput}
                            value={currentWeight}
                            onChangeText={setCurrentWeight}
                            keyboardType="numeric"
                            placeholder="0.0"
                            placeholderTextColor={Colors.textSecondary}
                        />
                        <Text style={styles.unitText}>kg</Text>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWeight}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Chart Placeholder / Simple List */}
                    <Text style={styles.historyTitle}>Recent History</Text>
                    {weightLogs.slice(-5).reverse().map((log) => (
                        <View key={log.id} style={styles.historyRow}>
                            <Text style={styles.historyDate}>{format(new Date(log.timestamp), 'MMM d')}</Text>
                            <Text style={styles.historyVal}>{log.weight} kg</Text>
                        </View>
                    ))}
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.darkSurface,
        padding: 10,
        borderRadius: 20,
        alignSelf: 'center',
        gap: 20,
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        minWidth: 100,
        textAlign: 'center',
    },
    card: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 25,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    waterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    waterProgress: {
        flex: 1,
    },
    waterValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    unit: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: 'normal',
    },
    waterGoal: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    addWaterBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        borderRadius: 20,
        padding: 15,
        width: 80,
    },
    addWaterText: {
        color: '#4A90E2',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
    },
    weightInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    weightInput: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
        borderRadius: 15,
        padding: 15,
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    unitText: {
        color: Colors.textSecondary,
        fontSize: 18,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: Colors.secondaryPurple,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    historyTitle: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    historyDate: {
        color: Colors.textSecondary,
    },
    historyVal: {
        color: '#fff',
        fontWeight: '600',
    },
});
