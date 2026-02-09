import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { createUserProfile, UserProfile } from '../services/userService';
import { calculateNutritionalTargets } from '../services/aiService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        gender: '',
        age: '',
        height: '',
        weight: '',
        activityLevel: '',
        goal: ''
    });

    const updateForm = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = async () => {
        if (!user) return;

        // Basic validation
        if (!form.gender || !form.age || !form.height || !form.weight || !form.activityLevel || !form.goal) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            // Calculate targets using AI
            const targets = await calculateNutritionalTargets(
                parseInt(form.age),
                form.gender,
                parseFloat(form.height),
                parseFloat(form.weight),
                form.activityLevel,
                form.goal
            );

            const profile: UserProfile = {
                uid: user.uid,
                gender: form.gender as any,
                age: parseInt(form.age),
                height: parseFloat(form.height),
                weight: parseFloat(form.weight),
                activityLevel: form.activityLevel as any,
                goal: form.goal as any,
                targets,
                createdAt: Date.now()
            };

            await createUserProfile(profile);

            // Navigate to main app
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderOption = (key: string, value: string, label: string) => (
        <TouchableOpacity
            style={[styles.optionBtn, form[key as keyof typeof form] === value && styles.optionBtnSelected]}
            onPress={() => updateForm(key, value)}
        >
            <Text style={[styles.optionText, form[key as keyof typeof form] === value && styles.optionTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Let's get to know you</Text>
                <Text style={styles.subtitle}>We'll use this to calculate your personalized plan.</Text>

                {/* Gender */}
                <Text style={styles.label}>Gender</Text>
                <View style={styles.row}>
                    {renderOption('gender', 'Male', 'Male')}
                    {renderOption('gender', 'Female', 'Female')}
                </View>

                {/* Age, Height, Weight */}
                <View style={styles.row}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.age}
                            onChangeText={(t) => updateForm('age', t)}
                            placeholder="25"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Height (cm)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.height}
                            onChangeText={(t) => updateForm('height', t)}
                            placeholder="175"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.weight}
                            onChangeText={(t) => updateForm('weight', t)}
                            placeholder="70"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Activity Level */}
                <Text style={styles.label}>Activity Level</Text>
                <View style={styles.wrapRow}>
                    {renderOption('activityLevel', 'Sedentary', 'Sedentary (Office job)')}
                    {renderOption('activityLevel', 'Light', 'Light (1-2 days/week)')}
                    {renderOption('activityLevel', 'Moderate', 'Moderate (3-5 days/week)')}
                    {renderOption('activityLevel', 'Active', 'Active (6-7 days/week)')}
                    {renderOption('activityLevel', 'Very Active', 'Very Active (Phyiscal job)')}
                </View>

                {/* Goal */}
                <Text style={styles.label}>Goal</Text>
                <View style={styles.wrapRow}>
                    {renderOption('goal', 'Weight Loss', 'Weight Loss')}
                    {renderOption('goal', 'Maintenance', 'Maintenance')}
                    {renderOption('goal', 'Muscle Gain', 'Muscle Gain')}
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generate Plan</Text>}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 30,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    },
    inputGroup: {
        flex: 1,
    },
    input: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    wrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },
    optionBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        backgroundColor: Colors.darkSurface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    optionBtnSelected: {
        backgroundColor: Colors.actionOrange,
        borderColor: Colors.actionOrange,
    },
    optionText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    optionTextSelected: {
        color: '#fff',
    },
    primaryBtn: {
        backgroundColor: Colors.tertiaryGreen,
        borderRadius: 30,
        padding: 18,
        alignItems: 'center',
        marginTop: 40,
    },
    primaryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
