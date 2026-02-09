import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MacroGridProps {
    protein: number;
    carbs: number;
    fat: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
}

export default function MacroGrid({ protein, carbs, fat, proteinTarget, carbsTarget, fatTarget }: MacroGridProps) {
    const renderValue = (val: number, target?: number) => (
        <Text style={styles.value}>
            {val}
            {target ? <Text style={styles.target}> / {target}</Text> : ''}
            <Text style={styles.unit}> g</Text>
        </Text>
    );

    return (
        <View style={styles.container}>
            {/* Protein Card (Purple) */}
            <View style={[styles.card, { backgroundColor: Colors.secondaryPurple }]}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="flash" size={16} color="#fff" />
                </View>
                <View>
                    {renderValue(protein, proteinTarget)}
                    <Text style={styles.label}>Protein</Text>
                </View>
            </View>

            {/* Carbs Card (Blue/Orange?) - Let's use Orange for Carbs */}
            <View style={[styles.card, { backgroundColor: Colors.actionOrange }]}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="pizza" size={16} color="#fff" />
                </View>
                <View>
                    {renderValue(carbs, carbsTarget)}
                    <Text style={styles.label}>Carbs</Text>
                </View>
            </View>

            {/* Fat Card (Green) */}
            <View style={[styles.card, { backgroundColor: Colors.tertiaryGreen }]}>
                <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="leaf" size={16} color="#fff" />
                </View>
                <View>
                    {/* Fat card used dark text in previous version, keeping it consistant or white? 
                        Previous version had explicit dark text colors. I'll stick to white for uniformity or revert if needed.
                        Actually, Green usually needs dark text.
                    */}
                    <Text style={[styles.value, { color: Colors.darkBackground }]}>
                        {fat}
                        {fatTarget ? <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16 }}> / {fatTarget}</Text> : ''}
                        <Text style={[styles.unit, { color: Colors.darkBackground }]}> g</Text>
                    </Text>
                    <Text style={[styles.label, { color: Colors.darkBackground }]}>Fat</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10, // Reduced gap to fit 3 cards
        paddingHorizontal: 20,
        marginTop: 20,
    },
    card: {
        flex: 1,
        borderRadius: 20, // Slightly smaller radius
        padding: 12, // Reduced padding
        height: 140,
        justifyContent: 'space-between',
    },
    iconBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    value: {
        fontSize: 20, // Slightly smaller font
        fontWeight: 'bold',
        color: '#fff',
    },
    target: {
        fontSize: 14,
        fontWeight: 'normal',
        opacity: 0.8,
    },
    unit: {
        fontSize: 12,
        fontWeight: 'normal',
    },
    label: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
});
