import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';

interface CalorieHeroProps {
    caloriesConsumed: number;
    calorieGoal: number;
}

export default function CalorieHero({ caloriesConsumed, calorieGoal }: CalorieHeroProps) {
    const remaining = Math.max(0, calorieGoal - caloriesConsumed);
    const percentage = Math.min(100, (caloriesConsumed / calorieGoal) * 100);

    const pieData = [
        { value: caloriesConsumed, color: Colors.darkBackground }, // Consumed (Dark track on yellow)
        { value: remaining, color: 'rgba(255,255,255,0.3)' }, // Remaining (Lighter track)
    ];

    // Actually, distinct design from inspiration:
    // Card is Yellow.
    // Ring is likely Black (consumed) + White/Transparent (remaining)
    // Or Ring is "Process"

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Calories left</Text>
                <View style={styles.flameIcon}>
                    <Ionicons name="flame" size={16} color={Colors.darkBackground} />
                </View>
            </View>

            <View style={styles.chartContainer}>
                {/* 
                   Gifted Charts PieChart:
                   We want a ring. `donut` prop.
                   Inner circle color = Yellow (Card bg).
                 */}
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                    {/* Rotate if needed to start from bottom, but standard is top/right */}
                    <PieChart
                        data={[
                            { value: caloriesConsumed, color: Colors.darkBackground },
                            { value: remaining, color: 'rgba(20,20,20,0.1)' }
                        ]}
                        donut
                        radius={70}
                        innerRadius={55}
                        backgroundColor={Colors.primaryYellow} // Match card
                        centerLabelComponent={() => (
                            <View style={{ transform: [{ rotate: '180deg' }] }}>
                                <Text style={styles.centerValue}>{remaining}</Text>
                            </View>
                        )}
                    />
                </View>
            </View>

            <View style={styles.labels}>
                {/* Optional small labels like "0" and "Goal" or similar */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primaryYellow,
        borderRadius: 30,
        padding: 20,
        marginHorizontal: 20,
        height: 250, // Fixed height for hero overlap look
        justifyContent: 'space-between',
        shadowColor: Colors.primaryYellow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: Colors.darkBackground,
        fontSize: 16,
        fontWeight: '600',
    },
    flameIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.darkBackground,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    }
});
