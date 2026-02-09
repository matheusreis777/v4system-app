import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Painel() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    nome: "",
    email: "",
    cpfCnpj: "",
    telefone: "",
    empresaId: undefined as number | undefined,
  });

  useEffect(() => {
    async function carregarEmpresa() {
      const empresaIdStorage = await AsyncStorage.getItem("@empresaId");
      const nomeEmpresa = await AsyncStorage.getItem("@nameempresa");

      setNomeEmpresa(nomeEmpresa || "");

      if (empresaIdStorage) {
        const id = Number(empresaIdStorage);
        setEmpresaId(id);
        setFilters((prev) => ({ ...prev, empresaId: id }));
      }
    }

    carregarEmpresa();
  }, []);

  function limpar() {}

  return (
    <View style={styles.screen}>
      <Header title="Listagem de Veículos" empresa={nomeEmpresa} />

      <View style={styles.filtersHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="filter" size={22} color="#ffffff" />
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={limpar}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <BottomTab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e6e8ea" },

  filtersHeader: {
    padding: 16,
    backgroundColor: "#1844a2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -30,
    height: 80,
  },

  filterButton: { flexDirection: "row", gap: 6 },
  filterText: { color: "#ffffff", fontWeight: "600", fontSize: 18 },
  clearText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },

  container: { padding: 16, flex: 1 },
});
