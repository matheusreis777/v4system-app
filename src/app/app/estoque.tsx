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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { router } from "expo-router";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";

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
  const { theme } = useTheme();

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
          <Text style={[styles.placa, { color: theme.primary, fontFamily: Fonts.condensedBold }]}>{maskPlate(item.placa)}</Text>

          <View style={[styles.statusBadge, { backgroundColor: theme.mode === "light" ? "#EDF0F4" : "#1A4480" }]}>
            <Text style={[styles.statusText, { color: theme.text, fontFamily: Fonts.medium }]}>{item.statusVeiculo.toUpperCase()}</Text>
          </View>
        </View>

        {/* VEÍCULO */}
        <Text style={[styles.title, { color: theme.primary, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {item.marca} {item.modelo}
        </Text>

        <Text style={[styles.subtitle, { fontFamily: Fonts.regular }]}>
          {item.tipoVeiculo} • {item.anoModelo}/{item.anoFabricacao}
        </Text>

        {/* GRID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoMini}>{item.km.toLocaleString()} km</Text>
          <Text style={styles.infoMini}>{item.cor}</Text>
          <Text style={styles.infoMini}>{item.combustivel}</Text>
        </View>

        {/* VALOR */}
        <Text style={[styles.valor, { color: theme.accent, fontFamily: Fonts.condensedBold }]}>
          R${" "}
          {item.valorVenda?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header title="Listagem de Veículos" />

      <LinearGradient
        colors={["#061D3D", "#1A4480"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.filtersHeader}
      >
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
      </LinearGradient>

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
                      tipoVeiculoId: id,
                      marcaId: undefined,
                      modeloId: undefined,
                    };

                    reload({
                      tipoVeiculoId: id,
                      marcaId: undefined,
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
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.mode === "light" ? "#fff" : "#1A4480" }]}>
              <Feather name="search" size={20} color={theme.accent} style={styles.searchIcon} />
              <TextInput
                value={filters.placa}
                placeholder="Qual placa você procura?"
                placeholderTextColor={theme.mode === "light" ? "#94A3B8" : "#888"}
                maxLength={8}
                style={[styles.searchInput, { color: theme.text, fontFamily: Fonts.medium }]}
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, placa: maskPlate(t) }))
                }
                onSubmitEditing={aplicarFiltros}
              />
              {filters.placa.length > 0 && (
                <TouchableOpacity onPress={() => setFilters(p => ({ ...p, placa: "" }))}>
                  <Feather name="x" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
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
  screen: { flex: 1 },

  filtersHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
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
  filterText: { color: "#ffffff", fontFamily: Fonts.condensedBold, fontSize: 18, textTransform: "uppercase" },
  clearText: { color: "#ffffff", fontSize: 16, fontFamily: Fonts.medium, textTransform: "uppercase" },

  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },

  container: { padding: 16, flex: 1 },

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
    fontSize: 18,
    letterSpacing: 1,
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
    fontSize: 18,
    textAlign: "right",
  },
});
