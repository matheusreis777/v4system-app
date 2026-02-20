import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import Header from "../../components/Header/Header";
import Input from "../../components/Input";
import Button from "../../components/Button";
import ToastService from "../../components/alerts/ToastService";
import { novoLeadService } from "../../services/novoLeadService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NovoLead() {
  const [nome, setNome] = useState("");
  const [telefoneMask, setTelefoneMask] = useState("");
  const [telefoneNumero, setTelefoneNumero] = useState<number | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [observacao, setObservacao] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Utils
  // ============================
  const apenasNumeros = (valor: string) => valor.replace(/\D/g, "");

  const formatarTelefone = (valor: string) => {
    const n = apenasNumeros(valor);

    if (n.length <= 10) {
      return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    }

    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  };

  // ============================
  // Validação
  // ============================
  const validarFormulario = () => {
    let novosErros: any = {};

    if (!nome.trim()) {
      novosErros.nome = "O nome é obrigatório";
    }

    if (!telefoneNumero) {
      novosErros.telefone = "O telefone é obrigatório";
    } else if (telefoneNumero.toString().length < 10) {
      novosErros.telefone = "Telefone inválido";
    }

    if (!observacao.trim()) {
      novosErros.observacao = "A observação é obrigatória";
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // ============================
  // Submit
  // ============================
  async function handleSalvar() {
    if (loading) return;

    if (!validarFormulario()) {
      ToastService.error(
        "Campos obrigatórios não preenchidos",
        "Preencha nome, telefone e descrição.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await novoLeadService.salvar({
        nome,
        telefone: Number(telefoneNumero),
        cpfCnpj: cpfCnpj ? apenasNumeros(cpfCnpj) : "",
        observacao,
        empresaId: Number(await AsyncStorage.getItem("@empresaId")),
        vendedorId: Number(await AsyncStorage.getItem("@vendedorId")),
      });

      if (response.status !== 200) {
        ToastService.error(
          "Erro ao salvar lead",
          "Não foi possível salvar o lead.",
        );
        return;
      }

      ToastService.success(
        "Lead cadastrado com sucesso",
        "Você foi redirecionado para tela de recepção.",
      );

      router.push("/app/painel");
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.message || "Erro de comunicação com o servidor.";
      ToastService.error("Erro", mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        title="Cadastro de novo Lead"
        leftIcon="chevron-left"
        onLeftPress={router.back}
      />

      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.filtersBox}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* NOME */}
            <Text>
              Nome <Text style={styles.obrigatorios}>*</Text>
            </Text>
            <Input
              placeholder="Nome do lead"
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setErrors({ ...errors, nome: null });
              }}
            />
            {errors.nome && <Text style={styles.error}>{errors.nome}</Text>}

            {/* TELEFONE */}
            <Text>
              Telefone <Text style={styles.obrigatorios}>*</Text>
            </Text>
            <Input
              placeholder="Telefone do lead"
              keyboardType="numeric"
              value={telefoneMask}
              onChangeText={(text) => {
                const numeros = apenasNumeros(text);
                setTelefoneMask(formatarTelefone(text));
                setTelefoneNumero(numeros ? Number(numeros) : null);
                setErrors({ ...errors, telefone: null });
              }}
            />
            {errors.telefone && (
              <Text style={styles.error}>{errors.telefone}</Text>
            )}

            {/* CPF / CNPJ */}
            <Input
              label="CPF/CNPJ"
              placeholder="CPF/CNPJ do lead"
              keyboardType="numeric"
              value={cpfCnpj}
              onChangeText={setCpfCnpj}
            />

            {/* DESCRIÇÃO */}
            <Text>
              Descrição Inicial <Text style={styles.obrigatorios}>*</Text>
            </Text>
            <Input
              placeholder="Descrição inicial do lead"
              inputStyle={styles.observacao}
              multiline
              value={observacao}
              onChangeText={(text) => {
                setObservacao(text);
                setErrors({ ...errors, observacao: null });
              }}
            />
            {errors.observacao && (
              <Text style={styles.error}>{errors.observacao}</Text>
            )}

            <Text style={styles.textObrigatorios}>
              <Text style={styles.obrigatorios}>*</Text> campos obrigatórios
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Salvando...</Text>
              </View>
            ) : (
              <Button title="Salvar" onPress={handleSalvar} />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  filtersBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  observacao: {
    height: 120,
  },
  textObrigatorios: {
    color: "#838080",
    fontSize: 11,
    marginBottom: 10,
  },
  obrigatorios: {
    color: "red",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
});
