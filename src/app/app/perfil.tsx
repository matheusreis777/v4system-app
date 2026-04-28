import { View, Text, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import { router } from "expo-router";
import { maskCPF, maskPhone } from "../../utils/masks";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";

interface Usuario {
  nome: string;
  cpf: string;
  telefone: string;
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    try {
      // 👉 OPÇÃO 1: usuário salvo como objeto
      const userStorage = await AsyncStorage.getItem("@usuario");

      if (userStorage) {
        const user = JSON.parse(userStorage);
        setUsuario(user);
        setNomeUsuario(user.nome);
        return;
      }

      // 👉 OPÇÃO 2: campos separados
      const nome = await AsyncStorage.getItem("@nameUser");
      const cpf = await AsyncStorage.getItem("@login");
      const telefone = await AsyncStorage.getItem("@telefone");

      setNomeUsuario(nome || "");

      if (nome && cpf) {
        setUsuario({
          nome,
          cpf,
          telefone: telefone ?? "",
        });
      }
    } catch (error) {}
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/auth/login/");
        },
      },
    ]);
  }

  return (
    <>
      <Header
        title="Perfil"
        rightIcons={[
          {
            icon: "power",
            onPress: handleLogout,
          },
        ]}
      />

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            {/* NOME */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>NOME</Text>
              <Text style={[styles.fieldValue, { textAlign: "right" }]}>
                {nomeUsuario || "-"}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* CPF */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>LOGIN (CPF)</Text>
              <Text style={[styles.fieldValue, { textAlign: "right" }]}>
                {usuario?.cpf ? maskCPF(usuario.cpf) : "-"}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* TELEFONE */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>TELEFONE</Text>
              <Text style={[styles.fieldValue, { textAlign: "right" }]}>
                {usuario?.telefone ? maskPhone(usuario.telefone) : "-"}
              </Text>
            </View>
          </View>
        </View>

        <BottomTab />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  content: {
    padding: 20,
  },

  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  field: {
    paddingVertical: 14,
  },

  fieldLabel: {
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  fieldValue: {
    fontSize: 16,
    color: "#111",
    fontFamily: Fonts.medium,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
});
