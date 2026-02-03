import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import BottomTab from "../components/BottomTab/BottomTab";
import { Feather } from "@expo/vector-icons";
import { painelDoVendedorService } from "../services/painelDoVendedorService";
import { PainelDoVendedorDto } from "../models/PainelDoVendedorDto";
import { PainelDoVendedorFiltro } from "../models/PainelDoVendedorFiltro";
import Input from "../components/Input";
import Button from "../components/Button";
import { FilterDropdown } from "../components/FilterDropdown/FilterDropdown";
import { useLookups } from "../contexts/LookupContext";
import { maskPhone, maskData, maskPlate } from "../utils/masks";
import { Tag } from "../components/Tag";
import {
  obterCorMomento,
  obterCorNegociacao,
  obterCorVendedor,
} from "../utils/tagColors";

import {
  obterLabelMomento,
  obterLabelStatus,
  obterLabelTipoNegociacao,
} from "../utils/enums/enumLabels";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CardMovimentacaoProps {
  item: PainelDoVendedorDto;
  onCancel: () => void;
}

export default function Painel() {
  const {
    status,
    momentos,
    tiposNegociacao,
    vendedores,
    loading: loadingLookups,
  } = useLookups();

  const [showFilters, setShowFilters] = useState(false);
  const [loadingPainel, setLoadingPainel] = useState(false);
  const [dados, setDados] = useState<PainelDoVendedorDto[]>([]);

  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    statusId: 170 as number | undefined,
    momentoId: undefined as number | undefined,
    tipoNegociacaoId: undefined as number | undefined,
    vendedorId: undefined as number | undefined,
    placa: "",
    cliente: "",
    telefone: "",
  });

  async function carregarPagina(pagina: number, append = false) {
    if (loadingMais || refreshing) return;

    append ? setLoadingMais(true) : setLoadingInicial(true);

    try {
      const filtro: PainelDoVendedorFiltro = {
        EmpresaId: Number(await AsyncStorage.getItem("@empresaId")),
        StatusMovimentacaoId: filters.statusId,
        MomentoId: filters.momentoId,
        TipoNegociacaoId: filters.tipoNegociacaoId,
        VendedorId: filters.vendedorId ? [filters.vendedorId] : undefined,
        Placa: filters.placa || undefined,
        Nome: filters.cliente || undefined,
        Telefone: filters.telefone
          ? filters.telefone.replace(/\D/g, "")
          : undefined,
        Pagina: pagina,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "DataInclusao",
        Ordem: "DESC",
      };

      const response = await painelDoVendedorService.consultar(filtro);
      const lista = response.data.lista ?? [];

      setHasMore(lista.length === PAGE_SIZE);
      setPage(pagina);

      setDados((prev) => (append ? [...prev, ...lista] : lista));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o painel");
    } finally {
      setLoadingInicial(false);
      setLoadingMais(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarPagina(1, false);
  }, []);

  function aplicarFiltros() {
    setShowFilters(false);
    setHasMore(true);
    carregarPagina(0, false);
  }

  async function carregarMais() {
    if (loadingMais || !hasMore) return;

    setLoadingMais(true);

    try {
      const filtro: PainelDoVendedorFiltro = {
        StatusMovimentacaoId: filters.statusId,
        MomentoId: filters.momentoId,
        TipoNegociacaoId: filters.tipoNegociacaoId,
        VendedorId: filters.vendedorId ? [filters.vendedorId] : undefined,
        Placa: filters.placa || undefined,
        Nome: filters.cliente || undefined,
        Telefone: filters.telefone
          ? filters.telefone.replace(/\D/g, "")
          : undefined,
        Pagina: page + 1,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "DataInclusao",
        Ordem: "DESC",
      };

      const response = await painelDoVendedorService.consultar(filtro);
      const lista = response.data.lista ?? [];

      setDados((prev) => [...prev, ...lista]);
      setPage((prev) => prev + 1);
      setHasMore(lista.length === PAGE_SIZE);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar mais registros");
    } finally {
      setLoadingMais(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    setHasMore(true);
    setPage(1);
    carregarPaginaInicial();
  }

  async function carregarPaginaInicial(pagina: number = 1) {
    try {
      const filtro: PainelDoVendedorFiltro = {
        StatusMovimentacaoId: filters.statusId,
        MomentoId: filters.momentoId,
        TipoNegociacaoId: filters.tipoNegociacaoId,
        VendedorId: filters.vendedorId ? [filters.vendedorId] : undefined,
        Pagina: 1,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "DataInclusao",
        Ordem: "DESC",
      };

      const response = await painelDoVendedorService.consultar(filtro);
      const lista = response.data.lista ?? [];

      setDados(lista);
      setHasMore(lista.length === PAGE_SIZE);
    } finally {
      setRefreshing(false);
    }
  }

  function limpar() {
    setFilters({
      statusId: 170,
      momentoId: undefined,
      tipoNegociacaoId: undefined,
      vendedorId: undefined,
      placa: "",
      cliente: "",
      telefone: "",
    });
    onRefresh();
  }

  return (
    <View style={styles.screen}>
      <Header
        title="Painel de Movimentações"
        rightIcons={[{ icon: "plus", onPress: () => {} }]}
      />

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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 210 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.filtersBox}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FilterDropdown
                label="Status"
                options={status}
                value={filters.statusId}
                onChange={(id) => setFilters((p) => ({ ...p, statusId: id }))}
              />

              <FilterDropdown
                label="Momento"
                options={momentos}
                value={filters.momentoId}
                onChange={(id) => setFilters((p) => ({ ...p, momentoId: id }))}
              />

              <FilterDropdown
                label="Tipo de Negociação"
                options={tiposNegociacao}
                value={filters.tipoNegociacaoId}
                onChange={(id) =>
                  setFilters((p) => ({ ...p, tipoNegociacaoId: id }))
                }
              />

              <FilterDropdown
                label="Vendedor"
                options={vendedores}
                value={filters.vendedorId}
                onChange={(id) => setFilters((p) => ({ ...p, vendedorId: id }))}
              />

              <Text style={styles.inputLabel}>Placa</Text>
              <Input
                value={filters.placa}
                placeholder="ABC-1D23"
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, placa: maskPlate(t) }))
                }
              />

              <Text style={styles.inputLabel}>Nome do Cliente</Text>
              <Input
                value={filters.cliente}
                onChangeText={(t) => setFilters((p) => ({ ...p, cliente: t }))}
              />

              <Text style={styles.inputLabel}>Telefone</Text>
              <Input
                keyboardType="numeric"
                placeholder="(99) 9 9999-9999"
                value={filters.telefone}
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, telefone: maskPhone(t) }))
                }
              />

              <Button onPress={aplicarFiltros} title="Aplicar filtros" />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {!showFilters && (
        <FlatList
          data={dados}
          keyExtractor={(i) => String(i.movimentacaoId)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CardMovimentacao
              item={item}
              onCancel={() => {
                Alert.alert(
                  "Cancelar movimentação",
                  `Deseja cancelar ${item.clienteNome}?`,
                  [
                    { text: "Não", style: "cancel" },
                    { text: "Sim", style: "destructive" },
                  ],
                );
              }}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={carregarMais}
                disabled={loadingMais}
              >
                {loadingMais ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <Text style={styles.loadMoreText}>Carregar mais</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <BottomTab />
    </View>
  );
}

function safeLabel(label?: string | null) {
  return typeof label === "string" && label.trim().length > 0 ? label : null;
}

function CardMovimentacao({ item, onCancel }: CardMovimentacaoProps) {
  const labelMomento = safeLabel(
    item.momentoId ? obterLabelMomento(item.momentoId) : null,
  );

  const labelTipo = safeLabel(
    item.tipoNegociacaoId
      ? obterLabelTipoNegociacao(item.tipoNegociacaoId)
      : null,
  );

  const labelStatus = safeLabel(
    item.statusMovimentacaoId
      ? obterLabelStatus(item.statusMovimentacaoId)
      : null,
  );

  const dataExibida =
    item.statusMovimentacaoId === 414 && item.dataAgendamento
      ? maskData(item.dataAgendamento)
      : item.dataInclusao
        ? maskData(item.dataInclusao)
        : "-";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.clienteNome ?? "Cliente"}</Text>
      </View>

      <View style={styles.cardInfoRow}>
        <Text style={styles.cardInfoLeft}>
          {item.telefone ? maskPhone(String(item.telefone)) : "-"}
        </Text>

        <Text style={styles.cardInfoRight}>{dataExibida}</Text>
      </View>

      {!!item.ultimaObservacaoNaMovimentacao && (
        <Text style={styles.cardDesc}>
          {item.ultimaObservacaoNaMovimentacao}
        </Text>
      )}

      <View style={styles.cardTags}>
        {labelMomento && (
          <Tag label={labelMomento} color={obterCorMomento(item.momentoId)} />
        )}

        {labelTipo && (
          <Tag
            label={labelTipo}
            color={obterCorNegociacao(item.tipoNegociacaoId)}
          />
        )}

        {item.vendedorNome && (
          <Tag label={item.vendedorNome} color={obterCorVendedor()} />
        )}

        {labelStatus && <Tag label={labelStatus} color="#475569" />}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#2563EB" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onCancel}>
          <Feather name="trash-2" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>
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
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  chipActive: { backgroundColor: "#2563EB" },
  chipText: { color: "#334155" },
  chipTextActive: { color: "#fff", fontWeight: "600" },

  inputLabel: { marginTop: 12 },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
  },

  list: { paddingHorizontal: 16, paddingBottom: 120 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  cardHeader: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
  },

  cardTitle: { color: "#fff", fontWeight: "600" },
  cardInfoRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardInfoLeft: {
    color: "#64748B",
    fontSize: 13,
  },

  cardInfoRight: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "right",
  },

  cardDesc: { marginTop: 6 },

  cardTags: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    flexWrap: "wrap",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  filtersScroll: {
    height: "70%",
  },

  loadMoreButton: {
    marginVertical: 20,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  loadMoreText: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
