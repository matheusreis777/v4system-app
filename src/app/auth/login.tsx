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
import { pushService } from "../../services/pushService";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

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

  // ✅ FUNÇÃO SEGURA PARA PEGAR PUSH TOKEN
  async function getPushToken() {
    try {
      // 🚫 Não roda no Expo Go
      if (Constants.appOwnership === "expo") {
        console.log("Push não disponível no Expo Go");
        return null;
      }

      if (!Device.isDevice) {
        Alert.alert("Push", "Use um celular físico para notificações");
        return null;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Permissão de notificação negada");
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      console.log("PUSH TOKEN:", token);

      return token;
    } catch (error) {
      console.log("Erro ao obter push token:", error);
      return null;
    }
  }

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

      // ✅ SALVA DADOS DO USUÁRIO
      await AsyncStorage.setItem("@telefone", loginData.telefone.toString());
      await AsyncStorage.setItem("@perfil", loginData.usuarioPerfilDescricao);
      await AsyncStorage.setItem("@usuarioId", loginData.usuarioId.toString());

      if (loginData.usuarioPerfilDescricao === "Vendedor") {
        await AsyncStorage.setItem(
          "@vendedorId",
          loginData.usuarioId.toString(),
        );
      }

      // ✅ PUSH NÃO PODE QUEBRAR O LOGIN
      try {
        const token = await getPushToken();

        if (token) {
          await pushService.salvar({
            usuarioId: loginData.usuarioId,
            pushToken: token,
            plataforma: Platform.OS,
          });

          console.log("Push token salvo com sucesso");
        }
      } catch (pushError) {
        console.log("Erro ao registrar push:", pushError);
      }

      // ✅ NAVEGA MESMO SE O PUSH FALHAR
      router.replace("/app/intro");
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
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          <View style={styles.card}>
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
              onChangeText={setCpf}
              keyboardType="numeric"
            />

            <Input
              label="Senha"
              placeholder="Senha"
              value={senha}
              onChangeText={setPassword}
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
              <Text style={styles.forgot}>Esqueci minha senha</Text>
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
    flex: 1,
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
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
