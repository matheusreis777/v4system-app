import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import BottomTab from "../../components/BottomTab/BottomTab";
import { Feather } from "@expo/vector-icons";
import { painelDoVendedorService } from "../../services/painelDoVendedorService";
import { movimentacaoService } from "../../services/movimentacaoService";
import { PainelDoVendedor } from "../../models/painelDoVendedor";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { FilterDropdown } from "../../components/FilterDropdown/FilterDropdown";
import { useLookups } from "../../contexts/LookupContext";
import { maskPhone, maskData, maskPlate } from "../../utils/masks";
import { Tag } from "../../components/Tag";
import {
  obterCorMomento,
  obterCorNegociacao,
  obterCorVendedor,
} from "../../utils/tagColors";

import {
  obterLabelMomento,
  obterLabelStatus,
  obterLabelTipoNegociacao,
} from "../../utils/enums/enumLabels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ModalCancelarMovimentacao } from "../../components/ModalCancelarMovimentacao/modal";
import ToastService from "../../components/alerts/ToastService";
import { PainelDoVendedorFiltro } from "../../models/painelDoVendedorFiltro";

interface CardMovimentacaoProps {
  item: PainelDoVendedor;
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
  const { theme } = useTheme();

  const [showFilters, setShowFilters] = useState(false);
  const [loadingPainel, setLoadingPainel] = useState(false);
  const [dados, setDados] = useState<PainelDoVendedor[]>([]);

  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [tipoPerfil, setTipoPerfil] = useState<string | null>(null);

  const [cancelarItem, setCancelarItem] = useState<PainelDoVendedor | null>(
    null,
  );
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const [filters, setFilters] = useState({
    statusId: 170 as number | undefined,
    momentoId: undefined as number | undefined,
    tipoNegociacaoId: undefined as number | undefined,
    vendedorId: undefined as number | undefined,
    placa: "",
    cliente: "",
    telefone: "",
    empresaId: undefined as number | undefined,
  });

  const requestLock = useRef(false);
  const cache = useRef(new Map());

  const renderItem = useCallback(
    ({ item }: { item: PainelDoVendedor }) => (
      <CardMovimentacao
        item={item}
        onCancel={() => {
          setCancelarItem(item);
          setMotivoCancelamento("");
        }}
      />
    ),
    [],
  );

  async function carregarPagina(
    pagina: number,
    append = false,
    filtrosOverride?: typeof filters,
  ) {
    const f = filtrosOverride ?? filters;

    if (!f.empresaId || requestLock.current) return;

    const key = JSON.stringify({ ...f, pagina });

    if (cache.current.has(key)) {
      const cached = cache.current.get(key);
      setDados((prev) => (pagina === 1 ? cached : [...prev, ...cached]));
      setPage(pagina);
      setHasMore(cached.length === PAGE_SIZE);
      return;
    }

    requestLock.current = true;
    append ? setLoadingMais(true) : setLoadingInicial(true);

    try {
      const filtro: PainelDoVendedorFiltro = {
        EmpresaId: Number(f.empresaId),
        StatusMovimentacaoId: f.statusId,
        MomentoId: f.momentoId,
        TipoNegociacaoId: f.tipoNegociacaoId,
        VendedorId: f.vendedorId || undefined,
        Placa: f.placa || undefined,
        Nome: f.cliente || undefined,
        Telefone: f.telefone?.replace(/\D/g, "") || undefined,
        Pagina: pagina,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "DataInclusao",
        Ordem: "DESC",
      };

      const response = await painelDoVendedorService.consultar(filtro);
      const lista = response.data.lista ?? [];

      cache.current.set(key, lista);

      setHasMore(lista.length === PAGE_SIZE);
      setPage(pagina);
      setDados((prev) => (pagina === 1 ? lista : [...prev, ...lista]));
    } finally {
      requestLock.current = false;
      setLoadingInicial(false);
      setLoadingMais(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function carregarEmpresa() {
      const empresaIdStorage = await AsyncStorage.getItem("@empresaId");
      const perfil = await AsyncStorage.getItem("@perfil");
      const vendedorIdStorage = await AsyncStorage.getItem("@vendedorId");

      setTipoPerfil(perfil);

      if (empresaIdStorage) {
        const empId = Number(empresaIdStorage);

        const novosFiltros = {
          statusId: 170,
          momentoId: undefined,
          tipoNegociacaoId: undefined,
          vendedorId:
            perfil === "Vendedor" && vendedorIdStorage
              ? Number(vendedorIdStorage)
              : undefined,
          placa: "",
          cliente: "",
          telefone: "",
          empresaId: empId,
        };

        setFilters(novosFiltros);

        // 🔥 CHAMA COM OS FILTROS CORRETOS
        carregarPagina(1, false, novosFiltros);
      }
    }

    carregarEmpresa();
  }, []);

  function aplicarFiltros() {
    setShowFilters(false);
    cache.current.clear();
    setPage(1);
    carregarPagina(1, false);
  }

  async function carregarMais() {
    if (!hasMore || loadingMais) return;
    carregarPagina(page + 1, true);
  }

  function onRefresh() {
    setRefreshing(true);
    cache.current.clear();
    setPage(1);
    carregarPagina(1, false);
  }
  async function carregarPaginaInicial(pagina: number = 1) {
    try {
      const filtro: PainelDoVendedorFiltro = {
        EmpresaId: filters.empresaId ?? 0,
        StatusMovimentacaoId: filters.statusId,
        MomentoId: filters.momentoId,
        TipoNegociacaoId: filters.tipoNegociacaoId,
        VendedorId: filters.vendedorId ? filters.vendedorId : undefined,
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
    const novosFiltros = {
      statusId: 170,
      momentoId: undefined,
      tipoNegociacaoId: undefined,
      vendedorId: tipoPerfil === "Vendedor" ? filters.vendedorId : undefined,
      placa: "",
      cliente: "",
      telefone: "",
      empresaId: filters.empresaId,
    };

    cache.current.clear();
    setFilters(novosFiltros);
    setPage(1);

    carregarPagina(1, false, novosFiltros); // 👈 ESSA LINHA RESOLVE
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <RNStatusBar barStyle="light-content" />
      <Header
        title="Gestão de Vendas"
        leftIcon="chevron-left"
        onLeftPress={() => router.replace("/app/dashboard")}
        rightIcons={[
          {
            icon: "plus",
            onPress: () => {
              router.push("/app/novoLead");
            },
          },
        ]}
      />

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

        <TouchableOpacity onPress={() => limpar()}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </LinearGradient>

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

              {tipoPerfil !== "Vendedor" && (
                <FilterDropdown
                  label="Vendedor"
                  options={vendedores}
                  value={filters.vendedorId}
                  onChange={(id) =>
                    setFilters((p) => ({ ...p, vendedorId: id }))
                  }
                />
              )}

              <Text style={[styles.inputLabel, { fontFamily: Fonts.bold, color: theme.text }]}>PLACA</Text>
              <Input
                value={filters.placa}
                placeholder="ABC-1D23"
                maxLength={8}
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, placa: maskPlate(t) }))
                }
              />

              <Text style={[styles.inputLabel, { fontFamily: Fonts.bold, color: theme.text }]}>NOME DO CLIENTE</Text>
              <Input
                value={filters.cliente}
                onChangeText={(t) => setFilters((p) => ({ ...p, cliente: t }))}
              />

              <Text style={[styles.inputLabel, { fontFamily: Fonts.bold, color: theme.text }]}>TELEFONE</Text>
              <Input
                keyboardType="numeric"
                placeholder="(99) 9 9999-9999"
                value={filters.telefone}
                maxLength={16}
                onChangeText={(t) =>
                  setFilters((p) => ({ ...p, telefone: maskPhone(t) }))
                }
              />

              <Button onPress={aplicarFiltros} title="Aplicar filtros" />
            </ScrollView>
          </KeyboardAwareScrollView>
        </View>
      )}

      {!showFilters && (
        <FlatList
          data={dados}
          keyExtractor={(i) => String(i.movimentacaoId)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={() => carregarMais()}
          onEndReachedThreshold={0.3}
        />
      )}

      <BottomTab />

      <ModalCancelarMovimentacao
        visible={!!cancelarItem}
        clienteNome={cancelarItem?.clienteNome}
        motivo={motivoCancelamento}
        onChangeMotivo={setMotivoCancelamento}
        onCancelar={() => {
          setCancelarItem(null);
          setMotivoCancelamento("");
        }}
        onConfirmar={async () => {
          if (!cancelarItem || !filters.empresaId) return;

          // 🔒 captura os valores ANTES do await
          const movimentacaoId = cancelarItem.movimentacaoId;
          const justificativa = motivoCancelamento;

          try {
            await movimentacaoService.cancelar({
              movimentacaoId,
              justificativa,
            });

            // fecha modal
            setCancelarItem(null);
            setMotivoCancelamento("");

            ToastService.success("Movimentação cancelada com sucesso");
            carregarPaginaInicial();
          } catch {
            Alert.alert("Erro", "Não foi possível cancelar a movimentação");
          }
        }}
      />
    </View>
  );
}

function safeLabel(label?: string | null) {
  return typeof label === "string" && label.trim().length > 0 ? label : null;
}

function irParaDetalhes(id: number) {
  router.push(`/app/detalhesMovimentacao/${id}`);
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
    <Pressable
      style={styles.card}
      onPress={() => irParaDetalhes(item.movimentacaoId)}
    >
      <View style={[styles.cardHeader, { backgroundColor: "#061D3D" }]}>
        <Text style={[styles.cardTitle, { fontFamily: Fonts.condensedBold }]}>{item.clienteNome ?? "Cliente"}</Text>
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
          {/* <Feather name="edit" size={24} color="#2563EB" /> */}
        </TouchableOpacity>

        {item.statusMovimentacaoId === 170 && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation(); // 🔥 impede abrir o card
              onCancel();
            }}
            hitSlop={10}
            style={({ pressed }) => [
              { padding: 6 },
              pressed && Platform.OS === "ios" && { opacity: 0.5 }, // feedback no iOS
            ]}
          >
            <Feather name="trash-2" size={24} color="#DC2626" />
          </Pressable>
        )}
      </View>
    </Pressable>
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
    marginBottom: 11,

    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  filterButton: { flexDirection: "row", gap: 6 },
  filterText: { color: "#ffffff", fontFamily: Fonts.condensedBold, fontSize: 18, textTransform: "uppercase" },
  clearText: { color: "#ffffff", fontSize: 16, fontFamily: Fonts.medium, textTransform: "uppercase" },

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

  inputLabel: {
    marginTop: 12,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
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

  cardTitle: { color: "#fff", textTransform: "uppercase", fontSize: 16, letterSpacing: 1 },
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
