
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface DashboardChartsProps {
    todayCalories: number;
    calorieGoal: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    weeklyData: { label: string, value: number }[];
}

export default function DashboardCharts({
    todayCalories,
    calorieGoal,
    macros,
    weeklyData
}: DashboardChartsProps) {

    const pieData = [
        { value: macros.protein, color: Colors.secondary, text: 'Protein', focused: true },
        { value: macros.carbs, color: Colors.accent, text: 'Carbs' },
        { value: macros.fat, color: '#EF4444', text: 'Fat' },
    ];

    const remainingCalories = Math.max(0, calorieGoal - todayCalories);
    const percentage = Math.min((todayCalories / calorieGoal) * 100, 100);

    return (
        <View style={styles.container}>
            {/* Today's Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Today's Overview</Text>
                <View style={styles.row}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <PieChart
                            data={pieData}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={70}
                            innerRadius={50}
                            innerCircleColor={'#232B5D'}
                            centerLabelComponent={() => {
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>{Math.round(percentage)}%</Text>
                                        <Text style={{ fontSize: 10, color: 'white' }}>Goal</Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                    <View style={styles.statsContainer}>
                        <Text style={styles.statLabel}>Protein: <Text style={styles.statValue}>{macros.protein}g</Text></Text>
                        <Text style={styles.statLabel}>Carbs: <Text style={styles.statValue}>{macros.carbs}g</Text></Text>
                        <Text style={styles.statLabel}>Fat: <Text style={styles.statValue}>{macros.fat}g</Text></Text>
                        <View style={styles.divider} />
                        <Text style={styles.totalCalories}>{todayCalories} / {calorieGoal} kcal</Text>
                    </View>
                </View>
            </View>

            {/* Weekly Trend Card */}
            <View style={[styles.card, { marginTop: 20 }]}>
                <Text style={styles.cardTitle}>Calorie Trend (Last 7 Days)</Text>
                <View style={{ paddingVertical: 20, paddingRight: 20 }}>
                    <BarChart
                        data={weeklyData}
                        barWidth={22}
                        noOfSections={3}
                        barBorderRadius={4}
                        frontColor={Colors.primary}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: 'gray' }}
                        xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        hideRules
                        isAnimated
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
    },
    statsContainer: {
        justifyContent: 'center',
    },
    statLabel: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 5,
    },
    statValue: {
        color: '#fff',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 10,
    },
    totalCalories: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
