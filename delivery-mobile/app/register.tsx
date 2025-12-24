import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    Modal,
    FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../constants/Config';

export default function RegisterScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch buildings on mount
    React.useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/buildings/`);
                setBuildings(response.data);
            } catch (error) {
                console.error("Erro ao buscar prédios:", error);
                Alert.alert("Erro", "Não foi possível carregar a lista de prédios.");
            }
        };
        fetchBuildings();
    }, []);

    const handleRegister = async () => {
        if (!username || !email || !password || !selectedBuilding) {
            Alert.alert("Erro", "Preencha todos os campos e selecione um prédio");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/api/register/`, {
                username,
                email,
                password,
                building_id: selectedBuilding.id
            });

            Alert.alert("Sucesso", "Conta criada! Faça login.", [
                { text: "OK", onPress: () => router.replace('/login') }
            ]);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.username ? "Usuário já existe" : "Erro ao criar conta";
            Alert.alert("Erro", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#5a32a3" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Junte-se ao Delivery IO</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Escolha um usuário"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Escolha uma senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Prédio / Unidade</Text>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[
                            styles.selectButtonText,
                            !selectedBuilding && { color: '#999' }
                        ]}>
                            {selectedBuilding ? selectedBuilding.building_name : "Selecione seu prédio"}
                        </Text>
                    </TouchableOpacity>

                    <Modal
                        visible={modalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Selecione o Prédio</Text>
                                <FlatList
                                    data={buildings}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                setSelectedBuilding(item);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <Text style={styles.modalItemText}>{item.building_name}</Text>
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

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>CADASTRAR</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.loginLinkText}>Já tem conta? Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5a32a3',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e0e0',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
        minHeight: 500,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#333',
        elevation: 2,
    },
    button: {
        backgroundColor: '#ff6b35',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#5a32a3',
        fontSize: 16,
        fontWeight: '600',
    },
    selectButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    selectButtonText: {
        fontSize: 16,
        color: '#333',
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
