import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { analyzeImage, FoodData } from '../../services/aiService';
import { addFoodLog } from '../../services/foodService';
import { useAuth } from '../../context/AuthContext';
import AnalysisResult from '../../components/AnalysisResult';
import { SAMPLE_FOOD_IMAGE } from '../../constants/SampleImages';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<FoodData | null>(null);

    const [permission, requestPermission] = ImagePicker.useCameraPermissions();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            handleImageSelected(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        if (!permission) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
                return;
            }
        }

        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED && permission?.canAskAgain) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Denied', 'You need to enable camera permissions in settings.');
                return;
            }
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            handleImageSelected(result.assets[0].uri);
        }
    };

    // Dev Helper
    const loadSampleImage = () => {
        handleImageSelected(SAMPLE_FOOD_IMAGE);
    };

    const handleImageSelected = async (uri: string) => {
        setImageUri(uri);
        setAnalyzing(true);
        setResult(null);

        try {
            console.log('Analyzing image...');
            const data = await analyzeImage(uri);
            console.log('Analysis complete:', data);

            if (data.isFood === false) {
                Alert.alert("No Food Detected", "It looks like this image doesn't contain food. Please try scanning a valid food item.", [
                    {
                        text: "OK",
                        onPress: () => {
                            setImageUri(null);
                        }
                    }
                ]);
                return;
            }

            setResult(data);
        } catch (error) {
            Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
            setImageUri(null); // Reset
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async (dataToSave: FoodData) => {
        if (!user) return;
        try {
            await addFoodLog(user.uid, {
                ...dataToSave,
                imageUri: imageUri || undefined
            });
            Alert.alert('Saved!', 'Meal logged successfully.', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset and go to Home
                        setResult(null);
                        setImageUri(null);
                        router.push('/');
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save log.');
        }
    };

    const handleDiscard = () => {
        setResult(null);
        setImageUri(null);
    };

    return (
        <View style={styles.container}>
            {/* If we have a result, show the Analysis Result Logic (Modal or Full Screen) */}
            <Modal visible={!!result} animationType="slide" presentationStyle="pageSheet">
                {result && (
                    <AnalysisResult
                        data={result}
                        imageUri={imageUri!}
                        onSave={handleSave}
                        onDiscard={handleDiscard}
                    />
                )}
            </Modal>

            {/* Scanner View (Mock Camera) */}
            <View style={styles.cameraPreview}>
                <Ionicons name="camera-outline" size={100} color="rgba(255,255,255,0.2)" />
                <Text style={styles.instruction}>Tap shutter to capture</Text>
            </View>

            {/* Loading Overlay */}
            {analyzing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.primaryYellow} />
                    <Text style={styles.loadingText}>Analyzing Food...</Text>
                </View>
            )}

            {/* Bottom Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
                    <Ionicons name="images" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
                    <View style={styles.shutterInner} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.galleryBtn} onPress={loadSampleImage}>
                    <Ionicons name="flask" size={24} color={Colors.actionOrange} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },
    instruction: {
        color: '#fff',
        marginTop: 20,
        fontSize: 18,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
    controls: {
        height: 150,
        backgroundColor: '#000',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 40,
    },
    shutterBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#fff',
    },
    galleryBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
