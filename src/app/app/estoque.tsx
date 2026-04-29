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
import Button from "../../components/Button";
import { maskPlate } from "../../utils/masks";
import { useLookupsEstoque } from "../../contexts/LookupEstoqueContext";

import { estoqueService } from "../../services/estoqueService";
import { EstoqueFiltro } from "../../models/estoqueFiltro";
import { EstoqueRetorno } from "../../models/estoqueRetorno";
import { router } from "expo-router";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";

const PAGE_SIZE = 10;

export default function Estoque() {
  const [veiculos, setVeiculos] = useState<EstoqueRetorno[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingMoreRef = useRef(false);

  const { tipoVeiculo, marca, modelo, statusVeiculo, reload } = useLookupsEstoque();
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

  async function carregarPagina(pagina: number, append = false, filtrosOverride = filters) {
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
      const data = response.data as any;
      const lista: EstoqueRetorno[] = data.lista || data.Lista || [];

      setHasMore(lista.length === PAGE_SIZE);
      setVeiculos((prev) => (append ? [...prev, ...lista] : lista));

      if (!append && lista.length === 0) {
        emptyAnim.setValue(0);
        Animated.timing(emptyAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível carregar o estoque");
    } finally {
      setLoadingInicial(false);
      setLoadingMais(false);
      setRefreshing(false);
      loadingMoreRef.current = false;
    }
  }

  function EmptyList() {
    return (
      <Animated.View style={[styles.emptyContainer, { opacity: emptyAnim }]}>
        <Feather name="search" size={48} color="#999" />
        <Text style={styles.emptyTitle}>Veículo não encontrado</Text>
        <Text style={styles.emptySubtitle}>Tente ajustar os filtros ou pesquisar outra placa</Text>
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

  function irParaChecklist(veiculoId: number, empresaId: number, dadosVeiculos: any) {
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

  function renderVeiculo({ item }: { item: any }) {
    const formatCurrency = (val: number) => {
      if (!val) return "R$ 0,00";
      return "R$ " + val.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const placa = item.placa || item.Placa || "";
    const m = item.modelo || item.Modelo;
    const marca = item.marca || item.Marca || m?.marca?.nome || m?.Marca?.Nome || "";
    const modelo = item.modeloNome || item.ModeloNome || m?.nome || m?.Nome || item.modelo || item.Modelo || "";
    
    const marcaModelo = item.marcaModelo || item.MarcaModelo || 
                       `${marca} ${modelo}`.trim() || "—";
    const valorVenda = item.valorVenda || item.ValorVenda || item.ResumoGeral?.ValorVenda || item.resumoGeral?.valorVenda || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.card}
        onPress={() => irParaChecklist(item.id || item.Id, empresaId ?? 0, item)}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.infoValue, { color: theme.primary, fontFamily: Fonts.bold, flex: 1 }]}>
             {marcaModelo}
          </Text>
          <Text style={{ color: theme.primary, fontFamily: Fonts.condensedBold, fontSize: 14, marginLeft: 8 }}>
            {maskPlate(placa)}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ANO</Text>
            <Text style={styles.infoValue}>{item.anoModelo || item.AnoModelo || 0}/{item.anoFabricacao || item.AnoFabricacao || 0}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <Text style={styles.infoValue}>{item.statusVeiculoNome || item.StatusVeiculoNome || "—"}</Text>
          </View>
          <View style={styles.infoItemValor}>
            <Text style={styles.infoLabel}>VALOR VENDA</Text>
            <Text style={[styles.infoValue, { fontSize: 18, color: theme.primary, fontFamily: Fonts.condensedBold }]}>
              {formatCurrency(valorVenda)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header title="Listagem de Veículos" />

      <LinearGradient
        colors={[theme.primary, theme.mode === 'light' ? '#FF9933' : '#CC6600']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.filtersHeader}
      >
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
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
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={120}
          >
            <ScrollView contentContainerStyle={styles.filtersBox} keyboardShouldPersistTaps="handled">
              <FilterDropdown
                label="Tipo Veículo"
                value={filters.tipoVeiculoId}
                options={tipoVeiculo}
                onChange={(id) => {
                  setFilters((p) => ({ ...p, tipoVeiculoId: id, marcaId: undefined, modeloId: undefined }));
                  reload({ tipoVeiculoId: id, marcaId: undefined });
                }}
              />
              <FilterDropdown
                label="Marca"
                options={marca}
                value={filters.marcaId}
                onChange={(id) => {
                  setFilters((p) => ({ ...p, marcaId: id, modeloId: undefined }));
                  reload({ tipoVeiculoId: filters.tipoVeiculoId, marcaId: id });
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
                onChange={(id) => setFilters((p) => ({ ...p, statusVeiculoId: id }))}
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
                onChangeText={(t) => setFilters((p) => ({ ...p, placa: maskPlate(t) }))}
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
            keyExtractor={(item, index) => String(item.id || index)}
            onEndReached={carregarMaisAutomatico}
            onEndReachedThreshold={0.2}
            renderItem={renderVeiculo}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              resetAndLoad();
            }}
            ListEmptyComponent={loadingInicial ? null : EmptyList}
            ListFooterComponent={loadingMais ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
            contentContainerStyle={!loadingInicial && veiculos.length === 0 ? { flexGrow: 1 } : undefined}
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
  searchContainer: { marginBottom: 16 },
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
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, height: "100%" },
  container: { padding: 16, flex: 1 },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#555", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#888", marginTop: 6, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: { width: "45%" },
  infoItemValor: { width: "100%", marginTop: 8 },
  infoLabel: { fontSize: 10, color: "#94A3B8", fontFamily: Fonts.bold },
  infoValue: { fontSize: 14, color: "#222", marginTop: 2 },
});
