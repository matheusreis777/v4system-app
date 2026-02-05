import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { Fonts } from "../../styles/fonts";
import { router } from "expo-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import ToastService from "./../../components/alerts/ToastService";
import { useAuth } from "../../contexts/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";

function validateStrongPassword(password: string) {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Mínimo de 6 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Ao menos uma letra maiúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Ao menos um número");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Ao menos um caractere especial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default function Forgot() {
  const [cpf, setLogin] = useState("");
  const [finalTelefone, setFinalTelefone] = useState<string>("");
  const [newSenha, setNewSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [telefoneValidado, setTelefoneValidado] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmError, setConfirmError] = useState("");
  const { validatePhone, trocaSenha } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const checklist = passwordChecklist(newSenha);

  const isPasswordValid =
    checklist.length &&
    checklist.uppercase &&
    checklist.number &&
    checklist.special;

  const isConfirmValid = newSenha.length > 0 && newSenha === confirmaSenha;

  const canSubmit = isPasswordValid && isConfirmValid;

  function passwordChecklist(password: string) {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  const handleAlterarSenha = async () => {
    Keyboard.dismiss();

    if (!telefoneValidado) {
      ToastService.error(
        "Ação não permitida",
        "Valide o telefone antes de alterar a senha",
      );
      return;
    }

    const validation = validateStrongPassword(newSenha);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      setConfirmError("");
      return;
    }

    if (newSenha !== confirmaSenha) {
      setConfirmError("As senhas não coincidem");
      setPasswordErrors([]);
      return;
    }

    showLoading("Alterando senha...");

    try {
      const cpfLimpo = cpf.replace(/\D/g, "");
      const retorno = await trocaSenha(cpfLimpo, newSenha);

      if (retorno !== 200) {
        throw new Error();
      }

      ToastService.success(
        "Senha alterada",
        "Agora você pode acessar o sistema",
      );

      router.replace("/auth/login");
    } catch {
      ToastService.error(
        "Falha ao alterar senha",
        "Tente novamente em alguns instantes",
      );
    } finally {
      hideLoading();
    }
  };

  const validaTelefone = async () => {
    if (!cpf || !finalTelefone) {
      Alert.alert("Atenção", "Preencha CPF e final do telefone.");
      return;
    }

    Keyboard.dismiss();
    showLoading("Validando telefone...");

    try {
      const retorno = await validatePhone(Number(finalTelefone), cpf);

      if (!retorno) {
        ToastService.error(
          "Falha na validação",
          "Telefone não confere com o CPF informado",
        );
        return;
      }

      ToastService.success(
        "Telefone validado",
        "Agora você pode redefinir sua senha",
      );

      setTelefoneValidado(true);
    } catch {
      ToastService.error("Erro", "Erro ao validar telefone, tente novamente");
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
          <View style={styles.card}>
            {/* Logo */}
            <Image
              source={require("../../../assets/logo-v4system.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Título */}
            <Text style={styles.subtitle}>Sistema de Gestão CRM</Text>

            <Text style={styles.subtitle}>Recuperar Senha</Text>

            {!telefoneValidado && (
              <>
                <Input
                  label="CPF"
                  placeholder="CPF"
                  type="cpf"
                  value={cpf}
                  onChangeText={(text) => setLogin(text)}
                  keyboardType="numeric"
                />

                <Input
                  label="Final do Telefone"
                  placeholder="0000"
                  value={finalTelefone}
                  keyboardType="numeric"
                  onChangeText={setFinalTelefone}
                  inputStyle={styles.finalTelefone}
                  maxLength={4}
                />

                <Text style={styles.labelSmall}>
                  Informe os últimos quatro dígitos do celular vinculado ao
                  Login.
                </Text>

                <Button
                  title="Validar Telefone"
                  onPress={() => {
                    // aqui você faz a validação real
                    // se deu certo:
                    validaTelefone();
                  }}
                />
              </>
            )}

            {telefoneValidado && (
              <>
                <Input
                  label="Nova Senha"
                  placeholder="Senha"
                  value={newSenha}
                  onChangeText={(text) => setNewSenha(text)}
                  isPassword
                />

                <View style={styles.checklist}>
                  <Text
                    style={checklist.length ? styles.checkOk : styles.checkFail}
                  >
                    {checklist.length ? "🟢" : "🔴"} Mínimo de 6 caracteres
                  </Text>

                  <Text
                    style={
                      checklist.uppercase ? styles.checkOk : styles.checkFail
                    }
                  >
                    {checklist.uppercase ? "🟢" : "🔴"} Letra maiúscula
                  </Text>

                  <Text
                    style={checklist.number ? styles.checkOk : styles.checkFail}
                  >
                    {checklist.number ? "🟢" : "🔴"} Número
                  </Text>

                  <Text
                    style={
                      checklist.special ? styles.checkOk : styles.checkFail
                    }
                  >
                    {checklist.special ? "🟢" : "🔴"} Caractere especial
                  </Text>
                </View>

                <Input
                  label="Confirmar Senha"
                  placeholder="Senha"
                  value={confirmaSenha}
                  onChangeText={(text) => setConfirmaSenha(text)}
                  isPassword
                />

                <View style={{ marginBottom: 16, alignSelf: "flex-start" }}>
                  {confirmaSenha.length > 0 && !isConfirmValid && (
                    <Text style={styles.checkFail}>
                      🔴 As senhas não coincidem
                    </Text>
                  )}

                  {isConfirmValid && (
                    <Text style={styles.checkOk}>🟢 Senhas conferem</Text>
                  )}
                </View>
                <Button
                  title="Alterar Senha"
                  onPress={() => {
                    // aqui você faz a validação real
                    // se deu certo:
                    handleAlterarSenha();
                  }}
                />
              </>
            )}
            {/* Esqueci senha */}
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.forgot}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé */}
          <Text style={styles.footer}>© 2026 V4 System</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
    color: "#545455",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: Fonts.medium,
  },

  label: {
    alignSelf: "flex-start",
    fontSize: 13,
    marginBottom: 6,
    color: "#334155",
    fontFamily: Fonts.regular,
  },

  labelSmall: {
    alignSelf: "flex-start",
    fontSize: 12,
    marginBottom: 12,
    color: "#334155",
    marginTop: -6,
    fontFamily: Fonts.regular,
  },

  finalTelefone: {
    textAlign: "right",
  },

  forgot: {
    marginTop: 20,
    color: "#2563EB",
    fontSize: 14,
    fontFamily: Fonts.regular,
  },

  footer: {
    marginTop: 28,
    fontSize: 12,
    color: "#64748B",
  },

  checklist: {
    alignSelf: "flex-start",
    marginBottom: 16,
    marginTop: 4,
  },

  checkOk: {
    fontSize: 12,
    color: "#16A34A", // verde moderno
    marginBottom: 2,
    fontFamily: Fonts.regular,
    alignSelf: "flex-start",
  },

  checkFail: {
    fontSize: 12,
    color: "#DC2626", // vermelho moderno
    marginBottom: 2,
    fontFamily: Fonts.regular,
    alignSelf: "flex-start",
  },

  buttonDisabled: {
    backgroundColor: "#94A3B8", // cinza elegante
  },
});
