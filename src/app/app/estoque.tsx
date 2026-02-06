import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  FlatList,
} from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import { router } from "expo-router";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FilterDropdown } from "../../components/FilterDropdown/FilterDropdown";
import Input from "../../components/Input";
import { maskPlate, maskPhone } from "../../utils/masks";
import { useLookupsEstoque } from "../../contexts/LookupEstoqueContext";
import Button from "../../components/Button";

export default function Estoque() {
  interface Veiculo {
    id: number;
    placa: string;
    statusVeiculo: string;
    tipoVeiculo: string;
    marca: string;
    modelo: string;
    anoModelo: number;
    anoFabricacao: number;
    km: number;
    cor: string;
    combustivel: string;
  }

  const [veiculos, setVeiculos] = useState<Veiculo[]>([
    {
      id: 1,
      placa: "ABC-1D23",
      statusVeiculo: "Disponível",
      tipoVeiculo: "SUV",
      marca: "Toyota",
      modelo: "Corolla Cross",
      anoModelo: 2023,
      anoFabricacao: 2022,
      km: 18000,
      cor: "Prata",
      combustivel: "Flex",
    },
  ]);

  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { tipoVeiculo, marca, modelo, statusVeiculo, reload } =
    useLookupsEstoque();

  const [filters, setFilters] = useState({
    placa: "",
    tipoVeiculoId: undefined as number | undefined,
    marcaId: undefined as number | undefined,
    modeloId: undefined as number | undefined,
    statusVeiculoId: undefined as number | undefined,
    empresaId: undefined as number | undefined,
  });

  useEffect(() => {
    async function carregarEstoque() {
      const empresaIdStorage = await AsyncStorage.getItem("@empresaId");
      const nomeEmpresa = await AsyncStorage.getItem("@nameempresa");

      setNomeEmpresa(nomeEmpresa || "");
      setEmpresaId(Number(empresaIdStorage));
    }

    carregarEstoque();
  }, []);

  useEffect(() => {
    if (filters.tipoVeiculoId) {
      reload({ tipoVeiculoId: filters.tipoVeiculoId });

      setFilters((p) => ({
        ...p,
        marcaId: undefined,
        modeloId: undefined,
      }));
    }
  }, [filters.tipoVeiculoId]);

  useEffect(() => {
    if (filters.tipoVeiculoId && filters.marcaId) {
      reload({
        tipoVeiculoId: filters.tipoVeiculoId,
        marcaId: filters.marcaId,
      });

      setFilters((p) => ({
        ...p,
        modeloId: undefined,
      }));
    }
  }, [filters.marcaId]);

  function limpar() {
    setFilters({
      placa: "",
      tipoVeiculoId: undefined,
      marcaId: undefined,
      modeloId: undefined,
      statusVeiculoId: undefined,
      empresaId: empresaId ?? 0,
    });

    reload();
  }

  function aplicarFiltros() {}

  function renderVeiculo({ item }: { item: Veiculo }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.placa}>{item.placa}</Text>
          <Text style={styles.status}>{item.statusVeiculo}</Text>
        </View>

        <Text style={styles.title}>
          {item.tipoVeiculo} • {item.marca} {item.modelo}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Ano:</Text>
          <Text style={styles.value}>
            {item.anoModelo}/{item.anoFabricacao}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>KM:</Text>
          <Text style={styles.value}>{item.km.toLocaleString()} km</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cor:</Text>
          <Text style={styles.value}>{item.cor}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Combustível:</Text>
          <Text style={styles.value}>{item.combustivel}</Text>
        </View>
      </View>
    );
  }

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

        <TouchableOpacity onPress={() => limpar()}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersScroll}>
          <KeyboardAwareScrollView
            enableOnAndroid
            enableAutomaticScroll
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            // 🔑 AJUSTES IMPORTANTES
            extraScrollHeight={Platform.OS === "ios" ? 10 : 120}
            extraHeight={Platform.OS === "ios" ? 100 : 140}
          >
            <ScrollView
              contentContainerStyle={styles.filtersBox}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FilterDropdown
                label="Tipo Veículo"
                value={filters.tipoVeiculoId}
                options={tipoVeiculo}
                onChange={(id) =>
                  setFilters((p) => ({ ...p, tipoVeiculoId: id }))
                }
              />

              <FilterDropdown
                label="Marca"
                options={marca}
                value={filters.marcaId}
                onChange={(id) => setFilters((p) => ({ ...p, marcaId: id }))}
              />

              <FilterDropdown
                label="Modelo"
                options={modelo}
                value={filters.modeloId}
                onChange={(id) => setFilters((p) => ({ ...p, modeloId: id }))}
              />

              <FilterDropdown
                label="Status Veículo"
                options={statusVeiculo}
                value={filters.statusVeiculoId}
                onChange={(id) =>
                  setFilters((p) => ({ ...p, statusVeiculoId: id }))
                }
              />

              <Button onPress={aplicarFiltros} title="Aplicar filtros" />
            </ScrollView>
          </KeyboardAwareScrollView>
        </View>
      )}

      {!showFilters && (
        <View style={styles.container}>
          <View style={styles.searchRow}>
            <View style={styles.inputWrapper}>
              <Input
                value={filters.placa}
                placeholder="Pesquise por placa, Ex: ABC-1D23"
                maxLength={8}
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, placa: maskPlate(t) }))
                }
              />
            </View>

            <Button
              onPress={aplicarFiltros}
              title="Filtrar"
              style={styles.filterButtonSmall}
            />
          </View>

          <FlatList
            data={veiculos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderVeiculo}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ width: "100%" }} // ✅ importante
          />
        </View>
      )}

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
    marginBottom: 11,

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  filterButton: { flexDirection: "row", gap: 6 },
  filterText: { color: "#ffffff", fontWeight: "600", fontSize: 18 },
  clearText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },

  filtersBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    paddingBottom: 40,
  },

  filterTitle: { fontWeight: "600", marginBottom: 6 },

  filtersScroll: {
    height: "70%",
  },

  container: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  inputWrapper: {
    flex: 1, // 🔑 ocupa o restante da largura
    marginRight: 8, // espaço entre input e botão
  },

  filterButtonSmall: {
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
    backgroundColor: "#1844a2",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 14,
  },

  card: {
    width: "100%", // ✅ ocupa toda a largura
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  placa: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1844a2",
  },

  status: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
  },

  label: {
    fontWeight: "600",
    width: 120,
    color: "#555",
  },

  value: {
    color: "#333",
  },
});
