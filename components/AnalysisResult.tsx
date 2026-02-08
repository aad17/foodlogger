import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FoodData } from '../services/aiService';
import { BlurView } from 'expo-blur';

interface AnalysisResultProps {
    data: FoodData;
    imageUri?: string;
    onSave: () => void;
    onDiscard: () => void;
}

const { width } = Dimensions.get('window');

export default function AnalysisResult({ data, imageUri, onSave, onDiscard }: AnalysisResultProps) {
    return (
        <View style={styles.container}>
            {/* Hero Image */}
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, { backgroundColor: Colors.darkSurface, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="image-outline" size={64} color={Colors.textSecondary} />
                    </View>
                )}

                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={onDiscard} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Sheet */}
            <View style={styles.contentSheet}>
                <View style={styles.handle} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Title & Qty */}
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.categoryBadge}>{data.category || 'Food'}</Text>
                            <Text style={styles.foodName}>{data.foodName}</Text>
                        </View>
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity><Ionicons name="remove" size={20} color={Colors.textPrimary} /></TouchableOpacity>
                            <Text style={styles.qtyText}>1</Text>
                            <TouchableOpacity><Ionicons name="add" size={20} color={Colors.textPrimary} /></TouchableOpacity>
                        </View>
                    </View>

                    {/* Health Score */}
                    <View style={styles.healthCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <Ionicons name="flash" size={16} color={Colors.textSecondary} />
                            <Text style={styles.healthTitle}>Health score</Text>
                        </View>
                        <View style={styles.healthBarBg}>
                            <View style={[styles.healthBarFill, { width: '70%', backgroundColor: Colors.tertiaryGreen }]} />
                        </View>
                        <Text style={styles.healthScoreText}>70%</Text>
                    </View>

                    {/* Nutrient Cards Row */}
                    <View style={styles.nutrientRow}>
                        {/* Calories - Purple in inspiration, Yellow in my concept? 
                            Inspiration: Purple=Calories, Yellow=Carbs. 
                            My system: Yellow=Calories. usage.
                            Let's follow inspiration colors for this card to match request "look and feel like inspirations".
                            Purple = Calories. Yellow = Carbs.
                        */}
                        <View style={[styles.nutrientCard, { backgroundColor: Colors.secondaryPurple }]}>
                            <Ionicons name="flame" size={20} color="#fff" />
                            <Text style={styles.nutrientLabel}>Calories</Text>
                            <Text style={styles.nutrientValue}>{data.calories} <Text style={{ fontSize: 12 }}>kcal</Text></Text>
                        </View>

                        <View style={[styles.nutrientCard, { backgroundColor: Colors.primaryYellow }]}>
                            <Ionicons name="flash" size={20} color={Colors.darkBackground} />
                            <Text style={[styles.nutrientLabel, { color: Colors.darkBackground }]}>Carbs</Text>
                            <Text style={[styles.nutrientValue, { color: Colors.darkBackground }]}>{data.macros.carbs} <Text style={{ fontSize: 12 }}>g</Text></Text>
                        </View>
                    </View>

                    {/* Second Row for Protein/Fat if needed, or list */}
                    <View style={[styles.nutrientRow, { marginTop: 10 }]}>
                        {/* Protein */}
                        <View style={[styles.nutrientCard, { backgroundColor: Colors.darkSurface, flex: 1 }]}>
                            <Text style={styles.nutrientLabel}>Protein</Text>
                            <Text style={styles.nutrientWhiteVal}>{data.macros.protein}g</Text>
                        </View>
                        {/* Fat */}
                        <View style={[styles.nutrientCard, { backgroundColor: Colors.darkSurface, flex: 1 }]}>
                            <Text style={styles.nutrientLabel}>Fat</Text>
                            <Text style={styles.nutrientWhiteVal}>{data.macros.fat}g</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { }}>
                            <Text style={styles.secondaryBtnText}>Fix results</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
                            <Text style={styles.primaryBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        height: '45%',
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerActions: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    contentSheet: {
        flex: 1,
        backgroundColor: Colors.darkBackground,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        marginTop: 10,
    },
    categoryBadge: {
        color: Colors.textSecondary, // or a soft pill
        fontSize: 12,
        backgroundColor: Colors.darkSurface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 5,
        overflow: 'hidden',
    },
    foodName: {
        color: Colors.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.darkSurface,
        borderRadius: 20,
        padding: 5,
        gap: 10,
    },
    qtyText: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    healthCard: {
        backgroundColor: Colors.darkSurface,
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
    },
    healthTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    healthBarBg: {
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
        marginVertical: 10,
    },
    healthBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    healthScoreText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    nutrientRow: {
        flexDirection: 'row',
        gap: 15,
    },
    nutrientCard: {
        flex: 1,
        borderRadius: 20,
        padding: 15,
        height: 100,
        justifyContent: 'space-between',
    },
    nutrientLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    nutrientValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    nutrientWhiteVal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 30,
    },
    secondaryBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: Colors.darkSurface,
        alignItems: 'center',
    },
    primaryBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: Colors.actionOrange,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: Colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
