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
import { EstoqueFiltro } from "../../models/estoqueFiltro";
import { EstoqueRetorno } from "../../models/estoqueRetorno";
import { useRef } from "react";
import { router } from "expo-router";

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
  const loadingMoreRef = useRef(false);

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
    setPage(1);
    setHasMore(true);
    carregarPagina(1, false);
  }, [filters.empresaId]);

  async function carregarPagina(
    pagina: number,
    append = false,
    filtrosOverride = filters,
  ) {
    const f = filtrosOverride;

    if (!f.empresaId) return;

    append ? setLoadingMais(true) : setLoadingInicial(true);

    try {
      const filtro: EstoqueFiltro = {
        EmpresaId: f.empresaId,
        Placa: f.placa.replace(/-/g, "") || "",
        TipoVeiculoId: f.tipoVeiculoId ?? 0,
        MarcaId: f.marcaId ?? 0,
        ModeloId: f.modeloId ?? 0,
        StatusVeiculoId: f.statusVeiculoId ?? 0,
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
        valorVenda: v.resumoGeral?.valorVenda ?? 0, // ✅ proteção
      }));

      setHasMore(mapped.length === PAGE_SIZE);

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
      loadingMoreRef.current = false; // ✅ libera nova chamada
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

  function resetAndLoad(novosFiltros = filters) {
    setPage(1);
    setHasMore(true);
    setVeiculos([]);
    carregarPagina(1, false, novosFiltros);
  }

  function aplicarFiltros() {
    setShowFilters(false);
    resetAndLoad();
  }

  function limpar() {
    const novosFiltros = {
      placa: "",
      tipoVeiculoId: undefined,
      marcaId: undefined,
      modeloId: undefined,
      statusVeiculoId: undefined,
      empresaId: empresaId ?? undefined,
    };

    setFilters(novosFiltros);
    resetAndLoad(novosFiltros);
  }

  function irParaChecklist(
    veiculoId: number,
    empresaId: number,
    dadosVeiculos: Veiculo,
  ) {
    router.push({
      pathname: "/app/dadosVeiculo",
      params: {
        veiculoId: veiculoId.toString(),
        empresaId: empresaId.toString(),
        dadosVeiculos: JSON.stringify(dadosVeiculos),
      },
    });
  }

  const carregarMaisAutomatico = useCallback(() => {
    if (loadingMoreRef.current || !hasMore || loadingInicial) return;

    loadingMoreRef.current = true;

    setPage((prev) => {
      const next = prev + 1;
      carregarPagina(next, true);
      return next;
    });
  }, [hasMore, loadingInicial]);

  function renderVeiculo({ item }: { item: Veiculo }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => irParaChecklist(item.id, empresaId ?? 0, item)}
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.placa}>{maskPlate(item.placa)}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.statusVeiculo}</Text>
          </View>
        </View>

        {/* VEÍCULO */}
        <Text style={styles.title} numberOfLines={1}>
          {item.marca} {item.modelo}
        </Text>

        <Text style={styles.subtitle}>
          {item.tipoVeiculo} • {item.anoModelo}/{item.anoFabricacao}
        </Text>

        {/* GRID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoMini}>{item.km.toLocaleString()} km</Text>
          <Text style={styles.infoMini}>{item.cor}</Text>
          <Text style={styles.infoMini}>{item.combustivel}</Text>
        </View>

        {/* VALOR */}
        <Text style={styles.valor}>
          R${" "}
          {item.valorVenda?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Listagem de Veículos" />

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

      {showFilters && (
        <View style={styles.filtersScroll}>
          <KeyboardAwareScrollView
            enableOnAndroid
            enableAutomaticScroll
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === "ios" ? 10 : 120}
            extraHeight={Platform.OS === "ios" ? 100 : 140}
          >
            <ScrollView
              contentContainerStyle={styles.filtersBox}
              keyboardShouldPersistTaps="handled"
            >
              <FilterDropdown
                label="Tipo Veículo"
                value={filters.tipoVeiculoId}
                options={tipoVeiculo}
                onChange={(id) => {
                  setFilters((p) => {
                    const novo = {
                      ...p,
                      marcaId: id,
                      modeloId: undefined,
                    };

                    reload({
                      tipoVeiculoId: novo.tipoVeiculoId,
                      marcaId: id,
                    });

                    return novo;
                  });
                }}
              />

              <FilterDropdown
                label="Marca"
                options={marca}
                value={filters.marcaId}
                onChange={(id) => {
                  setFilters((p) => ({
                    ...p,
                    marcaId: id,
                    modeloId: undefined,
                  }));

                  reload({
                    tipoVeiculoId: filters.tipoVeiculoId,
                    marcaId: id,
                  });
                }}
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
            onEndReached={carregarMaisAutomatico}
            onEndReachedThreshold={0.2}
            renderItem={renderVeiculo}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              resetAndLoad();
            }}
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

  filtersBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    paddingBottom: 40,
  },

  filtersScroll: { height: "70%", marginTop: 20 },
  filterButton: { flexDirection: "row", gap: 6 },
  filterText: { color: "#ffffff", fontWeight: "600", fontSize: 18 },
  clearText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },

  container: { padding: 16, flex: 1 },

  searchBox: { borderRadius: 16 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  inputWrapper: { flex: 1, marginRight: 8 },

  filterButtonSmall: {
    height: 48,
    backgroundColor: "#1844a2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  placa: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1844a2",
  },

  statusBadge: {
    backgroundColor: "#EDF7ED",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2e7d32",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  infoMini: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },

  valor: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1844a2",
    textAlign: "right",
  },
});
