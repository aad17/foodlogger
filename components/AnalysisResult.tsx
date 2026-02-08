
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { FoodData } from '../services/aiService';

interface AnalysisResultProps {
    data: FoodData;
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
    const MacroBar = ({ label, value, total, color }: { label: string, value: number, total: number, color: string }) => {
        const percentage = Math.min((value / total) * 100, 100);
        return (
            <View style={styles.macroContainer}>
                <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>{label}</Text>
                    <Text style={styles.macroValue}>{value}g</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.foodName}>{data.foodName}</Text>
            <View style={styles.calorieBadge}>
                <Text style={styles.calories}>{data.calories}</Text>
                <Text style={styles.caloriesLabel}>KCAL</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Macros</Text>
                <MacroBar label="Protein" value={data.macros.protein} total={100} color={Colors.secondary} />
                <MacroBar label="Carbs" value={data.macros.carbs} total={100} color={Colors.accent} />
                <MacroBar label="Fat" value={data.macros.fat} total={100} color="#EF4444" />
            </View>

            {data.micros && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Micros</Text>
                    <View style={styles.microsGrid}>
                        {Object.entries(data.micros).map(([key, value]) => (
                            <View key={key} style={styles.microItem}>
                                <Text style={styles.microValue}>{value}</Text>
                                <Text style={styles.microLabel}>{key}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.timestamp}>{new Date(data.timestamp).toLocaleString()}</Text>
                <Text style={styles.category}>{data.category}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    foodName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    calorieBadge: {
        alignSelf: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    calories: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    caloriesLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 10,
    },
    macroContainer: {
        marginBottom: 10,
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    macroLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    microsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    microItem: {
        backgroundColor: Colors.background,
        padding: 10,
        borderRadius: 10,
        minWidth: '30%',
        alignItems: 'center',
    },
    microValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    microLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 15,
        marginTop: 10,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        textTransform: 'uppercase',
    }
});
