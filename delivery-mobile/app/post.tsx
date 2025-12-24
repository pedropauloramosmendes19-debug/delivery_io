import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Modal,
    FlatList
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../constants/Config';
import * as ImagePicker from 'expo-image-picker';

export default function PostScreen() {
    const router = useRouter();
    const { token, user } = useAuth();

    const [ownerName, setOwnerName] = useState('');
    const [apNumber, setApNumber] = useState('');

    // SelectBox state
    const [selectedPackageType, setSelectedPackageType] = useState<any>(null);
    const [packageTypes, setPackageTypes] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch Package Types
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/types/`);
                setPackageTypes(response.data);
            } catch (error) {
                console.error("Erro ao buscar tipos:", error);
                Alert.alert("Erro", "Não foi possível carregar os tipos de encomenda.");
            }
        };
        fetchTypes();
    }, []);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permissão necessária", "É necessário permitir o acesso à câmera.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!ownerName || !apNumber || !selectedPackageType || !image) {
            Alert.alert("Campos obrigatórios", "Preencha todos os campos e tire uma foto.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('owner_name', ownerName);
            formData.append('ap_number', apNumber);
            formData.append('package_type', selectedPackageType.id);
            // formData.append('building', user?.building || ''); // Backend likely infers building from user, but can send if needed

            // Append Image
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('photo_field', {
                uri: image,
                name: filename || 'photo.jpg',
                type,
            } as any);

            await axios.post(
                `${BASE_URL}/api/packages/list/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            Alert.alert("Sucesso", "Encomenda registrada com sucesso!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("Erro ao cadastrar:", error.response?.data || error.message);
            Alert.alert("Erro", "Falha ao registrar encomenda. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Nome do Morador</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: João da Silva"
                        value={ownerName}
                        onChangeText={setOwnerName}
                    />

                    <Text style={styles.label}>Número do Apartamento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 101"
                        value={apNumber}
                        onChangeText={setApNumber}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Tipo de Encomenda</Text>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[
                            styles.selectButtonText,
                            !selectedPackageType && { color: '#999' }
                        ]}>
                            {selectedPackageType ? selectedPackageType.type : "Selecione o tipo"}
                        </Text>
                    </TouchableOpacity>

                    {/* Botão de Foto */}
                    <Pressable style={styles.photoButton} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={24} color="#5a32a3" />
                                <Text style={styles.photoText}>Tirar Foto</Text>
                            </>
                        )}
                    </Pressable>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>CADASTRAR</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Modal SelectBox */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Selecione o Tipo</Text>
                            <FlatList
                                data={packageTypes}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setSelectedPackageType(item);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{item.type}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCloseText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    scrollContent: { padding: 20 },

    formCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    selectButton: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    selectButtonText: {
        fontSize: 16,
        color: '#333',
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#5a32a3',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginTop: 25,
        backgroundColor: '#f0e6ff'
    },
    photoText: {
        color: '#5a32a3',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#5a32a3',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
    modalCloseButton: {
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#ff6b35',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
