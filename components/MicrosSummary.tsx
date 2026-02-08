import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MicrosSummaryProps {
    micros: { [key: string]: string | number };
}

export default function MicrosSummary({ micros }: MicrosSummaryProps) {
    // Filter out common keys if needed or display key ones
    // For now, let's display specific ones if available, or just the first 6 unique ones found
    const displayKeys = Object.keys(micros).slice(0, 6);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Micronutrient Highlights</Text>
            {displayKeys.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic' }}>No micros recorded this week.</Text>
            ) : (
                <View style={styles.grid}>
                    {displayKeys.map((key, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.iconBg}>
                                <Ionicons name="nutrition" size={16} color={Colors.actionOrange} />
                            </View>
                            <Text style={styles.label}>{key}</Text>
                            <Text style={styles.value}>{micros[key]}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    card: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 15,
        padding: 15,
        width: '47%', // roughly 2 columns
        alignItems: 'flex-start',
    },
    iconBg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 138, 101, 0.1)', // Orange tint
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
