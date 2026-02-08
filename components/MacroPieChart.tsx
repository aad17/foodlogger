import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors } from '../constants/Colors';

interface MacroPieChartProps {
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

export default function MacroPieChart({ macros }: MacroPieChartProps) {
    const total = macros.protein + macros.carbs + macros.fat;

    // Avoid division by zero
    const safeTotal = total === 0 ? 1 : total;

    const pieData = [
        { value: macros.protein, color: Colors.secondaryPurple, text: `${Math.round((macros.protein / safeTotal) * 100)}%` },
        { value: macros.carbs, color: Colors.primaryYellow, text: `${Math.round((macros.carbs / safeTotal) * 100)}%` },
        { value: macros.fat, color: Colors.tertiaryGreen, text: `${Math.round((macros.fat / safeTotal) * 100)}%` },
    ];

    const renderDot = (color: string) => (
        <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color, marginRight: 5 }} />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Macro Distribution</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <PieChart
                    data={pieData}
                    donut
                    showGradient
                    sectionAutoFocus
                    radius={70}
                    innerRadius={50}
                    innerCircleColor={Colors.darkSurface}
                    centerLabelComponent={() => {
                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>{Math.round(total)}</Text>
                                <Text style={{ fontSize: 14, color: 'white' }}>g</Text>
                            </View>
                        );
                    }}
                />
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        {renderDot(Colors.secondaryPurple)}
                        <Text style={styles.legendText}>Protein: {Math.round(macros.protein)}g</Text>
                    </View>
                    <View style={styles.legendItem}>
                        {renderDot(Colors.primaryYellow)}
                        <Text style={styles.legendText}>Carbs: {Math.round(macros.carbs)}g</Text>
                    </View>
                    <View style={styles.legendItem}>
                        {renderDot(Colors.tertiaryGreen)}
                        <Text style={styles.legendText}>Fat: {Math.round(macros.fat)}g</Text>
                    </View>
                </View>
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
    legendContainer: {
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendText: {
        color: '#fff',
        fontSize: 14,
    },
});
