import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import { router } from "expo-router";

interface Usuario {
  nome: string;
  cpf: string;
  telefone: string;
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    try {
      // 👉 OPÇÃO 1: usuário salvo como objeto
      const userStorage = await AsyncStorage.getItem("usuario");

      if (userStorage) {
        setUsuario(JSON.parse(userStorage));
        return;
      }

      // 👉 OPÇÃO 2: campos separados
      const nome = await AsyncStorage.getItem("nome");
      const cpf = await AsyncStorage.getItem("cpf");
      const telefone = await AsyncStorage.getItem("telefone");

      if (nome && cpf) {
        setUsuario({
          nome,
          cpf,
          telefone: telefone ?? "",
        });
      }
    } catch (error) {
      console.log("Erro ao carregar usuário:", error);
    }
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
      <Header title="Perfil" />

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{usuario?.nome}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Login (CPF)</Text>
            <Text style={styles.value}>{usuario?.cpf}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{usuario?.telefone || "-"}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
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

  card: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#666",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },

  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
