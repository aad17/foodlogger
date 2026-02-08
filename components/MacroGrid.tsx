import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MacroGridProps {
    protein: number;
    carbs: number;
    fat: number;
}

export default function MacroGrid({ protein, carbs, fat }: MacroGridProps) {
    return (
        <View style={styles.container}>
            {/* Protein Card (Purple) */}
            <View style={[styles.card, { backgroundColor: Colors.secondaryPurple }]}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="flash" size={16} color="#fff" />
                </View>
                <View>
                    <Text style={styles.value}>{protein}<Text style={styles.unit}> gram</Text></Text>
                    <Text style={styles.label}>Protein</Text>
                </View>
            </View>

            {/* Fat/Carbs Card (Green - using for Fat/Other) */}
            <View style={[styles.card, { backgroundColor: Colors.tertiaryGreen }]}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="leaf" size={16} color="#fff" />
                </View>
                <View>
                    <Text style={[styles.value, { color: Colors.darkBackground }]}>{fat}<Text style={styles.unit}> gram</Text></Text>
                    <Text style={[styles.label, { color: Colors.darkBackground }]}>Fat</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 15,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    card: {
        flex: 1,
        borderRadius: 25,
        padding: 15,
        height: 140,
        justifyContent: 'space-between',
    },
    iconBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    unit: {
        fontSize: 14,
        fontWeight: 'normal',
    },
    label: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
});
