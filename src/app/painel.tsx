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

/* ================== MAPS TEMPORÁRIOS ================== */
const {
  status,
  momentos,
  tiposNegociacao,
  vendedores,
  loading: loadingLookups,
} = useLookups();

const STATUS_MAP: Record<string, number> = {
  Agendada: 1,
  "Em Andamento": 2,
  Finalizado: 3,
  Cancelado: 4,
};

const MOMENTO_MAP: Record<string, number> = {
  Qualificar: 1,
  Preparação: 2,
  Entrega: 3,
};

const TIPO_NEGOCIACAO_MAP: Record<string, number> = {
  Venda: 1,
  Troca: 2,
  Consignação: 3,
};

const VENDEDORES_MAP: Record<string, number> = {
  Brenda: 10,
  João: 12,
};

/* ================== COMPONENTE ================== */

export default function Painel() {
  const {
    status,
    momentos,
    tiposNegociacao,
    vendedores,
    loading: loadingLookups,
  } = useLookups();

  /* ================== STATES ================== */
  const [showFilters, setShowFilters] = useState(false);
  const [loadingPainel, setLoadingPainel] = useState(false);
  const [dados, setDados] = useState<PainelDoVendedorDto[]>([]);

  const [filters, setFilters] = useState({
    statusId: undefined as number | undefined,
    momentoId: undefined as number | undefined,
    tipoNegociacaoId: undefined as number | undefined,
    vendedorId: undefined as number | undefined,
    placa: "",
    cliente: "",
    telefone: "",
  });

  useEffect(() => {
    aplicarFiltros();
  }, []);

  /* ================== API ================== */

  async function aplicarFiltros() {
    setLoadingPainel(true);

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
        Pagina: 1,
        TamanhoDaPagina: 10,
        OrdenarPor: "DataInclusao",
        Ordem: "DESC",
      };

      setShowFilters(false);

      const response = await painelDoVendedorService.consultar(filtro);
      setDados(response.data.lista ?? []);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o painel");
    } finally {
      setLoadingPainel(false);
    }
  }

  function limpar() {
    setFilters({
      statusId: undefined,
      momentoId: undefined,
      tipoNegociacaoId: undefined,
      vendedorId: undefined,
      placa: "",
      cliente: "",
      telefone: "",
    });
    aplicarFiltros();
  }

  /* ================== FORMATADORES ================== */

  function formatPlaca(text: string) {
    let v = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v.length > 7) v = v.slice(0, 7);
    return v.length > 3 ? `${v.slice(0, 3)}-${v.slice(3)}` : v;
  }

  function formatTelefone(text: string) {
    let v = text.replace(/\D/g, "").slice(0, 11);
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 3) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length <= 7)
      return `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3, 7)}-${v.slice(7)}`;
  }

  /* ================== RENDER ================== */

  return (
    <View style={styles.screen}>
      <Header
        title="Painel de Movimentações"
        rightIcons={[{ icon: "plus", onPress: () => {} }]}
      />

      {/* FILTROS HEADER */}
      <View style={styles.filtersHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="filter" size={18} color="#ffffff" />
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
                  setFilters((p) => ({ ...p, placa: formatPlaca(t) }))
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
                  setFilters((p) => ({
                    ...p,
                    telefone: formatTelefone(t),
                  }))
                }
              />

              <Button onPress={aplicarFiltros} title="Aplicar filtros" />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {loadingPainel && <ActivityIndicator size="large" color="#2563EB" />}

      {/* LISTA */}

      {!showFilters && (
        <FlatList
          data={dados}
          keyExtractor={(i) => String(i.movimentacaoId)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CardMovimentacao item={item} onCancel={item} />
          )}
        />
      )}

      <BottomTab />
    </View>
  );
}

/* ================== COMPONENTES AUX ================== */

function FilterGroup({ title, options, value, onChange }: any) {
  return (
    <>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.chipsRow}>
        {options.map((o: string) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, value === o && styles.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text
              style={[styles.chipText, value === o && styles.chipTextActive]}
            >
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function CardMovimentacao({ item, onCancel }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.clienteNome}</Text>
      </View>

      <Text style={styles.cardInfo}>
        {item.telefone} • {item.dataAgendamento ?? item.dataInclusao}
      </Text>

      <Text style={styles.cardDesc}>{item.ultimaObservacaoNaMovimentacao}</Text>

      <View style={styles.cardActions}>
        <TouchableOpacity>
          <Feather name="edit" size={16} color="#2563EB" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onCancel(item)}>
          <Feather name="trash-2" size={16} color="#DC2626" />
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
  filterText: { color: "#ffffff", fontWeight: "600" },
  clearText: { color: "#ffffff" },

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
  cardInfo: { marginTop: 10, color: "#64748B" },
  cardDesc: { marginTop: 6 },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },

  filtersScroll: {
    height: "70%",
  },
});
