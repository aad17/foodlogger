import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek } from 'date-fns';

interface DateSelectorProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
    const today = new Date();
    const start = startOfWeek(selectedDate); // Show week around selected date or stick to current week? Let's stick to current week for simple MVP or week containing selected date
    // User probably wants to scroll back. For now let's just show a static strip of "this week" or "selected week".
    // Let's stick to "This Week" for now as per previous design, but allow selecting.

    // Actually, if I select a past date, I should probably see that date. 
    // Let's generate the week based on the selectedDate to allow navigating weeks if we added arrows.
    // For now, let's keep the "current week" view but allow selecting days within it, 
    // AND if the user selects a date (e.g. via calendar in future), we might need to shift.
    // To keep it simple: Show the week containing the `selectedDate`.

    const startOfSelectedWeek = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfSelectedWeek, i));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.monthSelector}>
                    <Text style={styles.monthText}>{format(selectedDate, 'MMMM')}</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.weekStrip}>
                {weekDays.map((date, index) => {
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dayItem, isSelected && styles.selectedDayItem]}
                            onPress={() => onSelectDate(date)}
                        >
                            <Text style={[styles.dayLabel, isSelected && styles.selectedText]}>
                                {format(date, 'EEEEE')}
                            </Text>
                            <View style={[styles.dateCircle, isSelected && styles.selectedDateCircle, !isSelected && isToday && styles.todayDateCircle]}>
                                <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                                    {format(date, 'd')}
                                </Text>
                            </View>
                        </TouchableOpacity>
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
    todayDateCircle: {
        borderWidth: 1,
        borderColor: Colors.actionOrange,
    },
});
