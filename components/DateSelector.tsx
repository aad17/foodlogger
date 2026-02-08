import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek } from 'date-fns';

export default function DateSelector() {
    const today = new Date();
    const start = startOfWeek(today);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.monthSelector}>
                    <Text style={styles.monthText}>{format(today, 'MMMM')}</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.weekStrip}>
                {weekDays.map((date, index) => {
                    const isSelected = format(date, 'd') === format(today, 'd');
                    return (
                        <View key={index} style={[styles.dayItem, isSelected && styles.selectedDayItem]}>
                            <Text style={[styles.dayLabel, isSelected && styles.selectedText]}>
                                {format(date, 'EEEEE')}
                            </Text>
                            <View style={[styles.dateCircle, isSelected && styles.selectedDateCircle]}>
                                <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                                    {format(date, 'd')}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.darkSurface,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    monthText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontFamily: 'System', // Replace with Inter if available
        fontWeight: '600',
    },
    notificationBtn: {
        padding: 8,
        backgroundColor: Colors.darkSurface, // Or purely transparent
        borderRadius: 20,
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        gap: 8,
    },
    selectedDayItem: {
        // active state styles
    },
    dayLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    dateCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    selectedDateCircle: {
        backgroundColor: Colors.actionOrange,
    },
    dateText: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    selectedText: {
        color: '#fff', // Always white on selected
    },
});
