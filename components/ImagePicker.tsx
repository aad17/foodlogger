
import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
    onImageSelected: (uri: string) => void;
}

export default function ImagePickerComponent({ onImageSelected }: ImagePickerProps) {
    const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });


        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.button}>
                <Ionicons name="images-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Select Food Image</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
                Select an image from your device to analyze nutrients.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        width: '100%',
        maxWidth: 300,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    helperText: {
        marginTop: 15,
        color: '#aaa',
        fontSize: 14,
    }
});
