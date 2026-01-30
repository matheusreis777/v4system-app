import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

export default function Intro() {
  const [nameUser, setNameUser] = useState("");
  const [empresas, setEmpresas] = useState<any[]>([]);
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  async function selectEmpresa(empresa: any) {
    await AsyncStorage.setItem("@empresaSelecionada", JSON.stringify(empresa));
    await AsyncStorage.setItem("@empresaId", String(empresa.id));
    router.replace("/painel");
  }

  useEffect(() => {
    async function loadUserData() {
      const name = await AsyncStorage.getItem("@nameUser");
      const empresasStorage = await AsyncStorage.getItem("@empresas");

      setNameUser(name || "");

      if (empresasStorage) {
        setEmpresas(JSON.parse(empresasStorage));
      }
    }

    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Olá, {nameUser} 👋</Text>
        <Text style={styles.subtitle}>
          Escolha a empresa que deseja acessar
        </Text>
      </View>

      {/* Lista de empresas */}
      <FlatList
        data={empresas}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => selectEmpresa(item)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Feather name="briefcase" size={22} color="#2563EB" />
              </View>
              <Text style={styles.nomeEmpresa}>{item.nome}</Text>
            </View>

            <Feather name="chevron-right" size={22} color="#94A3B8" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma empresa cadastrada.</Text>
        }
      />

      {/* Ação secundária */}
      <View style={styles.footer}>
        <Button title="Sair do sistema" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: StatusBar.currentHeight || 80,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    // sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    // sombra Android
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  nomeEmpresa: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },

  empty: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 40,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
