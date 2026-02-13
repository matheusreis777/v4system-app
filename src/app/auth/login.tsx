import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";
import Input from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../../components/Button";
import { useLoading } from "../../contexts/LoadingContext";
import { router } from "expo-router";
import { login } from "../../services/authService";

export default function Index() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [cpf, setCpf] = useState("");
  const [senha, setPassword] = useState("");
  const [stayConnected, setStayConnected] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const [empresas, setEmpresas] = useState<any[]>([]);

  useEffect(() => {
    loadEmpresas();
    loadSavedCredentials();
  }, []);

  const loadEmpresas = async () => {
    try {
      const empresasStorage = await AsyncStorage.getItem("@empresas");
      setEmpresas(empresasStorage ? JSON.parse(empresasStorage) : []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      await AsyncStorage.setItem("@login", cpf);

      const savedCpf = await AsyncStorage.getItem("@savedCpf");
      const savedSenha = await AsyncStorage.getItem("@savedSenha");

      if (savedCpf && savedSenha) {
        setCpf(savedCpf);
        setPassword(savedSenha);
        setStayConnected(true);
      }
    } catch (error) {
      console.error("Erro ao carregar credenciais salvas:", error);
    }
  };

  const loginScreen = async () => {
    if (!cpf || !senha) {
      Alert.alert("Atenção", "Preencha CPF e senha.");
      return;
    }

    Keyboard.dismiss();
    showLoading();

    try {
      const loginData = await signIn(cpf, senha);

      if (!loginData) {
        throw new Error("Login sem retorno");
      }

      await AsyncStorage.setItem("@telefone", loginData.telefone.toString());
      await AsyncStorage.setItem("@perfil", loginData.usuarioPerfilDescricao);

      if (loginData.empresas?.length === 1) {
        await AsyncStorage.setItem(
          "@empresaSelecionada",
          JSON.stringify(loginData.empresas[0]),
        );
        router.replace("/app/painel");
      } else {
        router.replace("/app/intro");
      }
    } catch (error) {
      console.log("ERRO LOGIN:", error);
      Alert.alert("Falha no login", "Verifique suas credenciais.");
    } finally {
      hideLoading();
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/background.png")}
      style={[styles.container]}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card]}>
            <Image
              source={require("../../../assets/logo-v4system.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Sistema de Gestão CRM</Text>

            <Input
              label="CPF"
              placeholder="CPF"
              type="cpf"
              value={cpf}
              onChangeText={(text) => setCpf(text)}
              keyboardType="numeric"
            />

            <Input
              label="Senha"
              placeholder="Senha"
              value={senha}
              onChangeText={(text) => setPassword(text)}
              isPassword
            />

            <View style={styles.switchRow}>
              <Switch
                value={stayConnected}
                onValueChange={setStayConnected}
                trackColor={{ false: "#999", true: theme.primary }}
                thumbColor={theme.buttonBackground}
              />
              <Text style={[styles.switchLabel, { marginLeft: 12 }]}>
                Permanecer conectado
              </Text>
            </View>

            <Button title="Entrar" onPress={loginScreen} />

            <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
              <Text style={[styles.forgot]}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: theme.text }]}>
            © 2026 V4 System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // fallback caso a imagem demore
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 200,
    height: 40,
    marginBottom: 4,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#ffffff",

    // sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

    // sombra Android
    elevation: 9,
  },

  subtitle: {
    fontSize: 14,
    color: "#545455",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: Fonts.medium,
  },

  forgot: {
    marginTop: 20,
    color: "#2563EB",
    fontSize: 16,
    fontFamily: Fonts.regular,
  },

  footer: {
    marginTop: 28,
    fontSize: 12,
  },

  toggleButton: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "right",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
  },
  switchLabel: {
    color: "#383636",
    fontSize: 14,
    fontFamily: "Poppins",
  },
});
