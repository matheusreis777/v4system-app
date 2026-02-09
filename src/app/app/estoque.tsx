import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FilterDropdown } from "../../components/FilterDropdown/FilterDropdown";
import Input from "../../components/Input";
import { maskPlate } from "../../utils/masks";
import { useLookupsEstoque } from "../../contexts/LookupEstoqueContext";
import Button from "../../components/Button";

import { estoqueService } from "../../services/estoqueService";
import { EstoqueFiltro } from "../../models/EstoqueFiltro";
import { EstoqueRetorno } from "../../models/estoqueRetorno";

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
  valorVenda?: number;
}

const PAGE_SIZE = 10;

export default function Estoque() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { tipoVeiculo, marca, modelo, statusVeiculo, reload } =
    useLookupsEstoque();

  const emptyAnim = useState(new Animated.Value(0))[0];

  const [filters, setFilters] = useState({
    placa: "",
    tipoVeiculoId: undefined as number | undefined,
    marcaId: undefined as number | undefined,
    modeloId: undefined as number | undefined,
    statusVeiculoId: undefined as number | undefined,
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

  useEffect(() => {
    if (!filters.empresaId) return;
    resetAndLoad();
  }, [filters.empresaId]);

  async function carregarPagina(pagina: number, append = false) {
    if (!filters.empresaId) return;
    if (append && loadingMais) return;

    append ? setLoadingMais(true) : setLoadingInicial(true);

    try {
      const filtro: EstoqueFiltro = {
        EmpresaId: filters.empresaId,
        Placa: filters.placa.replace(/-/g, "") || "",
        TipoVeiculoId: filters.tipoVeiculoId ?? 0,
        MarcaId: filters.marcaId ?? 0,
        ModeloId: filters.modeloId ?? 0,
        StatusVeiculoId: filters.statusVeiculoId ?? 0,
        Pagina: pagina,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "Id",
        Ordem: "DESC",
      };

      const response = await estoqueService.consultar(filtro);

      const lista: EstoqueRetorno[] = response.data.lista ?? [];

      const mapped: Veiculo[] = lista.map((v) => ({
        id: v.id,
        placa: v.placa,
        statusVeiculo: v.statusVeiculoNome ?? "—",
        tipoVeiculo: v.tipoVeiculoDescricao ?? "—",
        marca: v.modelo?.marca?.nome ?? "",
        modelo: v.modelo?.nome ?? "",
        anoModelo: v.anoModelo,
        anoFabricacao: v.anoFabricacao,
        km: v.quilometragem ?? 0,
        cor: v.corNome ?? "",
        combustivel: String(v.combustivelNome ?? ""),
        valorVenda: v.resumoGeral.valorVenda ?? 0,
      }));

      setHasMore(mapped.length === PAGE_SIZE);
      setPage(pagina);
      setVeiculos((prev) => (append ? [...prev, ...mapped] : mapped));

      if (!append && mapped.length === 0) {
        emptyAnim.setValue(0);
        Animated.timing(emptyAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o estoque");
    } finally {
      setLoadingInicial(false);
      setLoadingMais(false);
      setRefreshing(false);
    }
  }

  function EmptyList() {
    return (
      <Animated.View
        style={[
          styles.emptyContainer,
          {
            opacity: emptyAnim,
            transform: [
              {
                translateY: emptyAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Feather name="search" size={48} color="#999" />
        <Text style={styles.emptyTitle}>Veículo não encontrado</Text>
        <Text style={styles.emptySubtitle}>
          Tente ajustar os filtros ou pesquisar outra placa
        </Text>
      </Animated.View>
    );
  }

  function resetAndLoad() {
    setPage(1);
    setHasMore(true);
    setVeiculos([]);
    carregarPagina(1, false);
  }

  function aplicarFiltros() {
    setShowFilters(false);
    resetAndLoad();
  }

  function limpar() {
    setFilters({
      placa: "",
      tipoVeiculoId: undefined,
      marcaId: undefined,
      modeloId: undefined,
      statusVeiculoId: undefined,
      empresaId: empresaId ?? 0,
    });

    resetAndLoad();
  }

  const carregarMaisAutomatico = useCallback(() => {
    if (!hasMore || loadingMais || loadingInicial) return;
    carregarPagina(page + 1, true);
  }, [page, hasMore, loadingMais, loadingInicial]);

  function renderVeiculo({ item }: { item: Veiculo }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.placa}>{maskPlate(item.placa)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.statusVeiculo}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {item.tipoVeiculo} • {item.marca} {item.modelo}
        </Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ano</Text>
            <Text style={styles.infoValue}>
              {item.anoModelo}/{item.anoFabricacao}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>KM</Text>
            <Text style={styles.infoValue}>{item.km.toLocaleString()} km</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cor</Text>
            <Text style={styles.infoValue}>{item.cor}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Combustível</Text>
            <Text style={styles.infoValue}>{item.combustivel}</Text>
          </View>

          <View style={styles.infoItemValor}>
            <Text style={styles.infoLabel}>Valor Venda</Text>
            <Text style={styles.infoValue}>
              R${" "}
              {item.valorVenda?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
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

        <TouchableOpacity onPress={limpar}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {!showFilters && (
        <View style={styles.container}>
          <View style={styles.searchBox}>
            <View style={styles.searchRow}>
              <View style={styles.inputWrapper}>
                <Input
                  value={filters.placa}
                  placeholder="Pesquise por placa (ABC-1D23)"
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
          </View>

          <FlatList
            data={veiculos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderVeiculo}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              resetAndLoad();
            }}
            onEndReached={carregarMaisAutomatico}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={loadingInicial ? null : EmptyList}
            ListFooterComponent={
              loadingMais ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
              ) : null
            }
            contentContainerStyle={
              !loadingInicial && veiculos.length === 0
                ? { flexGrow: 1 }
                : undefined
            }
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
  },

  filterButton: { flexDirection: "row", gap: 6 },
  filterText: { color: "#ffffff", fontWeight: "600", fontSize: 18 },
  clearText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },

  container: { padding: 16, flex: 1 },

  searchBox: { borderRadius: 16, elevation: 2 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  inputWrapper: { flex: 1, marginRight: 8 },

  filterButtonSmall: {
    height: 48,
    backgroundColor: "#1844a2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  placa: { fontSize: 18, fontWeight: "700", color: "#1844a2" },

  statusBadge: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  infoItem: { width: "48%" },
  infoItemValor: { width: "100%", alignItems: "flex-end" },
  infoLabel: { fontSize: 12, color: "#777" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#222" },

  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
});
