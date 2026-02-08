import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FoodData } from '../services/aiService';
import { format } from 'date-fns';

interface LogCardProps {
    log: FoodData;
}

export default function LogCard({ log }: LogCardProps) {
    // Helper to get time string safely
    const getTimeString = () => {
        if (!log.timestamp) return '';
        // @ts-ignore
        if (log.timestamp.toDate) {
            // @ts-ignore
            return format(log.timestamp.toDate(), 'h:mm a');
        }
        return format(new Date(log.timestamp), 'h:mm a');
    };

    // Helper for category icon/color
    const getCategoryDetails = () => {
        switch (log.category) {
            case 'Breakfast': return { icon: 'sunny', color: Colors.primaryYellow };
            case 'Lunch': return { icon: 'fast-food', color: Colors.actionOrange };
            case 'Dinner': return { icon: 'restaurant', color: Colors.secondaryPurple };
            case 'Snack': return { icon: 'cafe', color: Colors.tertiaryGreen };
            default: return { icon: 'nutrition', color: Colors.textSecondary };
        }
    };

    const { icon, color } = getCategoryDetails();

    return (
        <View style={styles.card}>
            {/* Left: Image or Icon */}
            <View style={styles.imageContainer}>
                {log.imageUri ? (
                    <Image source={{ uri: log.imageUri }} style={styles.image} />
                ) : (
                    <View style={[styles.iconPlaceholder, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon as any} size={24} color={color} />
                    </View>
                )}
            </View>

            {/* Middle: Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.foodName} numberOfLines={1}>{log.foodName}</Text>
                <Text style={styles.metaText}>
                    {log.category} • {getTimeString()}
                </Text>
                {/* Mini Macros */}
                {log.macros && (
                    <View style={styles.macroRow}>
                        <Text style={styles.macroText}>P:{Math.round(log.macros.protein)}</Text>
                        <Text style={styles.macroText}>C:{Math.round(log.macros.carbs)}</Text>
                        <Text style={styles.macroText}>F:{Math.round(log.macros.fat)}</Text>
                    </View>
                )}
            </View>

            {/* Right: Calories */}
            <View style={styles.calorieContainer}>
                <Text style={styles.calorieText}>{log.calories}</Text>
                <Text style={styles.calLabel}>kcal</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.darkSurface,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        marginRight: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    iconPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    foodName: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaText: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    },
    macroRow: {
        flexDirection: 'row',
        gap: 8,
    },
    macroText: {
        color: Colors.textSecondary,
        fontSize: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    calorieContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    calorieText: {
        color: Colors.primaryYellow,
        fontSize: 18,
        fontWeight: 'bold',
    },
    calLabel: {
        color: Colors.textSecondary,
        fontSize: 10,
    },
});
