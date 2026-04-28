import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { Fonts } from "../../styles/fonts";

export default function Intro() {
  const [nameUser, setNameUser] = useState("");
  const [empresas, setEmpresas] = useState<any[]>([]);
  const { signOut } = useAuth();
  const { theme } = useTheme();

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/login");
  }

  async function selectEmpresa(empresa: any) {
    await AsyncStorage.setItem("@empresaSelecionada", JSON.stringify(empresa));
    await AsyncStorage.setItem("@empresaId", String(empresa.id));
    await AsyncStorage.setItem("@nameempresa", empresa.nome);

    router.replace("/app/painel");
  }

  useEffect(() => {
    async function loadUserData() {
      const empresasStorage = await AsyncStorage.getItem("@empresas");

      if (empresasStorage) {
        setEmpresas(JSON.parse(empresasStorage));
      }
    }

    loadUserData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary, fontFamily: Fonts.condensedBold }]}>Olá, {nameUser} 👋</Text>
        <Text style={[styles.subtitle, { color: theme.text, fontFamily: Fonts.medium }]}>Escolha a empresa que deseja acessar</Text>
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
              <View style={[styles.iconBox, { backgroundColor: theme.mode === "light" ? "#FFF0E0" : "#CC6600" }]}>
                <Feather name="briefcase" size={22} color={theme.accent} />
              </View>
              <Text style={[styles.nomeEmpresa, { color: theme.text, fontFamily: Fonts.medium }]}>{item.nome}</Text>
            </View>

            <Feather name="chevron-right" size={22} color={theme.accent} />
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
    color: "#7A8CA3",
    textAlign: "center",
    fontFamily: Fonts.regular,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
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
    paddingBottom: Platform.OS === "android" ? 56 : 20,
  },
});
