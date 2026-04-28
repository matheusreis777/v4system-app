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

import { registerForPushNotificationsAsync } from "../../config/pushNotification";

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

  const handleStayConnectedToggle = async (value: boolean) => {
    setStayConnected(value);

    if (!value) {
      await AsyncStorage.removeItem("@savedCpf");
      await AsyncStorage.removeItem("@savedSenha");
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

      if (!loginData) throw new Error("Login sem retorno");

      // ✅ RESPEITA O SWITCH
      if (stayConnected) {
        await AsyncStorage.setItem("@savedCpf", cpf);
        await AsyncStorage.setItem("@savedSenha", senha);
      } else {
        await AsyncStorage.removeItem("@savedCpf");
        await AsyncStorage.removeItem("@savedSenha");
      }

      // ✅ DADOS DO USUÁRIO
      await AsyncStorage.setItem("@telefone", loginData.telefone.toString());
      await AsyncStorage.setItem("@perfil", loginData.usuarioPerfilDescricao);
      await AsyncStorage.setItem("@usuarioId", loginData.usuarioId.toString());

      if (loginData.usuarioPerfilDescricao === "Vendedor") {
        await AsyncStorage.setItem(
          "@vendedorId",
          loginData.usuarioId.toString(),
        );
      }

      // ✅ PUSH TOKEN
      try {
        const token = await registerForPushNotificationsAsync();
        console.log("🔑 TOKEN OBTIDO NO LOGIN:", token);
        if (token) {
          console.log("💾 SALVANDO TOKEN NO BACKEND...");
          await pushService.salvar({
            usuarioId: loginData.usuarioId,
            pushToken: token,
            plataforma: Platform.OS,
          });
          console.log("✅ TOKEN SALVO COM SUCESSO");
        } else {
          console.log("❌ TOKEN NULO - NÃO SALVOU");
        }
      } catch (pushError) {
        console.log("❌ ERRO AO SALVAR TOKEN:", pushError);
      }

      router.replace("/app/intro");
    } catch (error) {
      Alert.alert("Falha no login", "Verifique suas credenciais.");
    } finally {
      hideLoading();
    }
  };

  return (
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={[styles.subtitle, { color: theme.primary, fontFamily: Fonts.condensedBold }]}>SISTEMA DE GESTÃO CRM</Text>

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

            <Button title="Entrar" onPress={loginScreen} />

            <TouchableOpacity onPress={() => router.push("/auth/forgot")}>
              <Text style={styles.forgot}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: theme.text }]}>
            © 2026 ConnectCar System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  logo: {
    width: 200,
    height: 140,
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
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  forgot: {
    marginTop: 20,
    color: "#FF8000",
    fontSize: 15,
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.regular,
  },
});
