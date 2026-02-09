import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { createUserProfile, UserProfile } from '../services/userService';
import { calculateNutritionalTargets } from '../services/aiService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
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

    const handleNext = () => {
        if (step === 1 && !form.gender) return Alert.alert("Required", "Please select a gender");
        if (step === 2 && (!form.age || !form.height || !form.weight)) return Alert.alert("Required", "Please fill in all stats");
        if (step === 3 && !form.activityLevel) return Alert.alert("Required", "Please select activity level");
        if (step === 4 && !form.goal) return Alert.alert("Required", "Please select a goal");

        if (step < 4) {
            setStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
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
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            {[0, 1, 2, 3, 4].map((i) => (
                <View
                    key={i}
                    style={[
                        styles.stepDot,
                        i <= step ? styles.stepDotActive : styles.stepDotInactive
                    ]}
                />
            ))}
        </View>
    );

    const renderWelcome = () => (
        <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={40} color={Colors.primaryYellow} />
            </View>
            <Text style={styles.title}>Welcome to FoodLogger</Text>
            <Text style={styles.subtitle}>Let's create your personalized nutrition plan in just a few steps.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
                <Text style={styles.primaryBtnText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
        </View>
    );

    const renderGender = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your gender?</Text>
            <Text style={styles.stepSubtitle}>This helps us calculate your metabolic rate.</Text>
            <View style={styles.optionsGrid}>
                {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                        key={g}
                        style={[styles.bigOptionCard, form.gender === g && styles.bigOptionCardSelected]}
                        onPress={() => updateForm('gender', g)}
                    >
                        <Ionicons
                            name={g === 'Male' ? 'male' : 'female'}
                            size={40}
                            color={form.gender === g ? Colors.actionOrange : Colors.textSecondary}
                        />
                        <Text style={[styles.bigOptionText, form.gender === g && styles.textSelected]}>{g}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Body Stats</Text>
            <Text style={styles.stepSubtitle}>Be as accurate as possible.</Text>

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

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
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
                <View style={[styles.inputGroup, { flex: 1 }]}>
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
        </View>
    );

    const renderActivity = () => {
        const levels = [
            { id: 'Sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
            { id: 'Light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
            { id: 'Moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
            { id: 'Active', label: 'Active', desc: 'Exercise 6-7 days/week' },
            { id: 'Very Active', label: 'Very Active', desc: 'Hard exercise & physical job' },
        ];
        return (
            <ScrollView contentContainerStyle={styles.stepContent}>
                <Text style={styles.stepTitle}>Activity Level</Text>
                <Text style={styles.stepSubtitle}>How active are you normally?</Text>
                <View style={{ gap: 10 }}>
                    {levels.map((l) => (
                        <TouchableOpacity
                            key={l.id}
                            style={[styles.listOption, form.activityLevel === l.id && styles.listOptionSelected]}
                            onPress={() => updateForm('activityLevel', l.id)}
                        >
                            <View>
                                <Text style={[styles.listOptionTitle, form.activityLevel === l.id && styles.textSelected]}>{l.label}</Text>
                                <Text style={styles.listOptionDesc}>{l.desc}</Text>
                            </View>
                            {form.activityLevel === l.id && <Ionicons name="checkmark-circle" size={24} color={Colors.primaryYellow} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderGoal = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Goal</Text>
            <Text style={styles.stepSubtitle}>What do you want to achieve?</Text>
            <View style={{ gap: 15 }}>
                {['Weight Loss', 'Maintenance', 'Muscle Gain'].map((g) => (
                    <TouchableOpacity
                        key={g}
                        style={[styles.bigOptionCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20 }, form.goal === g && styles.bigOptionCardSelected]}
                        onPress={() => updateForm('goal', g)}
                    >
                        <Ionicons
                            name={g === 'Weight Loss' ? 'trending-down' : g === 'Muscle Gain' ? 'barbell' : 'git-commit'}
                            size={30}
                            color={form.goal === g ? Colors.actionOrange : Colors.textSecondary}
                        />
                        <Text style={[styles.bigOptionText, { marginLeft: 15 }, form.goal === g && styles.textSelected]}>{g}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderLoading = () => (
        <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primaryYellow} />
            <Text style={[styles.title, { marginTop: 20 }]}>Designing your plan...</Text>
            <Text style={styles.subtitle}>Our AI is calculating your optimal macros.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                {/* Header (Back & Steps) */}
                {step > 0 && !loading && (
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StepIndicator />
                        <View style={{ width: 40 }} />
                    </View>
                )}

                {/* Main Content Area */}
                <View style={styles.contentContainer}>
                    {loading ? renderLoading() : (
                        <Animated.View
                            key={step}
                            entering={FadeInRight}
                            exiting={FadeOutLeft}
                            style={{ flex: 1 }}
                        >
                            {step === 0 && renderWelcome()}
                            {step === 1 && renderGender()}
                            {step === 2 && renderStats()}
                            {step === 3 && renderActivity()}
                            {step === 4 && renderGoal()}
                        </Animated.View>
                    )}
                </View>

                {/* Footer (Next Button) */}
                {step > 0 && !loading && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                            <Text style={styles.nextBtnText}>{step === 4 ? "Generate Plan" : "Next"}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 50,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stepDotActive: {
        backgroundColor: Colors.primaryYellow,
        width: 20,
    },
    stepDotInactive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    stepContent: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    stepSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 30,
    },
    primaryBtn: {
        backgroundColor: Colors.primaryYellow,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 10,
    },
    primaryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Options
    optionsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20,
    },
    bigOptionCard: {
        flex: 1,
        backgroundColor: Colors.darkSurface,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    bigOptionCardSelected: {
        borderColor: Colors.actionOrange,
        backgroundColor: 'rgba(255,165,0,0.1)',
    },
    bigOptionText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: 10,
    },
    textSelected: {
        color: '#fff',
    },
    // Inputs
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 15,
        padding: 16,
        color: '#fff',
        fontSize: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flex: 1, // Ensure input expands
    },
    inputGroup: {
        marginBottom: 20,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    // List Options
    listOption: {
        backgroundColor: Colors.darkSurface,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    listOptionSelected: {
        borderColor: Colors.primaryYellow,
        backgroundColor: 'rgba(255,255,0,0.05)',
    },
    listOptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    listOptionDesc: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    // Footer
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    nextBtn: {
        backgroundColor: Colors.primaryYellow,
        borderRadius: 30,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    nextBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});
