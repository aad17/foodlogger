import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '../constants/Colors';

interface CalorieTrendChartProps {
    weeklyData: { day: string, calories: number }[];
    goal: number;
}

export default function CalorieTrendChart({ weeklyData, goal }: CalorieTrendChartProps) {
    const barData = weeklyData.map(item => ({
        value: item.calories,
        label: item.day,
        frontColor: item.calories > goal ? Colors.actionOrange : Colors.primaryYellow,
        topLabelComponent: () => (
            <Text style={{ color: '#fff', fontSize: 10, marginBottom: 2 }}>{item.calories}</Text>
        ),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Weekly Calories</Text>
            <View style={{ height: 250, paddingVertical: 10 }}>
                <BarChart
                    data={barData}
                    barWidth={30}
                    noOfSections={4}
                    barBorderRadius={4}
                    frontColor={Colors.primaryYellow}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    yAxisTextStyle={{ color: Colors.textSecondary }}
                    xAxisLabelTextStyle={{ color: Colors.textSecondary }}
                    hideRules
                    showReferenceLine1
                    referenceLine1Position={goal}
                    referenceLine1Config={{
                        color: Colors.actionOrange,
                        dashWidth: 2,
                        dashGap: 3,
                    }}
                />
            </View>
            <View style={styles.legend}>
                <View style={[styles.dot, { backgroundColor: Colors.actionOrange }]} />
                <Text style={styles.legendText}>Goal: {goal} kcal</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
});
