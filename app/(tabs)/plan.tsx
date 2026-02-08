import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function PlanScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Planner Coming Soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 18,
    },
});
