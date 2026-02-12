import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Input from "../../components/Input";
import Button from "../../components/Button";

import { clienteService } from "../../services/clienteService";
import { ClienteFiltro } from "../../models/clienteFiltro";
import { maskPhone, maskCPF } from "../../utils/masks";

interface FiltrosCliente {
  id?: null | number;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  empresaId?: number;
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
}

function filtrosIniciais(empresaId?: number): FiltrosCliente {
  return {
    id: null,
    nome: "",
    email: "",
    cpfCnpj: "",
    telefone: "",
    empresaId,
  };
}

const PAGE_SIZE = 10;

export default function Cliente() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filters, setFilters] = useState<FiltrosCliente>(filtrosIniciais());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const emptyAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    async function carregarEmpresa() {
      const empresaIdStorage = await AsyncStorage.getItem("@empresaId");
      if (empresaIdStorage) {
        const id = Number(empresaIdStorage);
        setEmpresaId(id);
        setFilters(filtrosIniciais(id));
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
      const filtro: ClienteFiltro = {
        id: filters.id ?? 0,
        EmpresaId: filters.empresaId,
        Nome: filters.nome,
        Email: filters.email,
        CpfCnpj: filters.cpfCnpj,
        Telefone: filters.telefone,
        Pagina: pagina,
        TamanhoDaPagina: PAGE_SIZE,
        OrdenarPor: "Id",
        Ordem: "DESC",
      };

      const response = await clienteService.consultar(filtro);
      const lista = response.data.lista ?? [];

      console.log(lista[0]);

      const mapped: Cliente[] = lista.map((v: any) => ({
        id: v.id,
        nome: v.nome,
        email: v.email,
        cpfCnpj: v.cpfCnpj,
        telefone: v.telefone,
      }));

      setHasMore(mapped.length === PAGE_SIZE);
      setPage(pagina);
      setClientes((prev) => (append ? [...prev, ...mapped] : mapped));

      if (!append && mapped.length === 0) {
        emptyAnim.setValue(0);
        Animated.timing(emptyAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os clientes");
    } finally {
      setLoadingInicial(false);
      setLoadingMais(false);
      setRefreshing(false);
    }
  }

  function resetAndLoad() {
    setPage(1);
    setHasMore(true);
    setClientes([]);
    carregarPagina(1, false);
  }

  function limpar() {
    setFilters(filtrosIniciais(empresaId ?? undefined));
    setShowFilters(false);
    resetAndLoad();
  }

  function aplicarFiltros() {
    setFilters((prev) => ({
      ...prev,
      nome: prev.nome.trim(),
      email: prev.email.trim(),
      cpfCnpj: prev.cpfCnpj.trim(),
      telefone: prev.telefone.trim(),
    }));

    setShowFilters(false);
    resetAndLoad();
  }

  function renderCliente({ item }: { item: Cliente }) {
    return (
      <View style={styles.card}>
        {/* Nome */}
        <Text style={styles.nome}>{item.nome}</Text>

        {/* CPF + Telefone na mesma linha */}
        <View style={styles.row}>
          <View style={styles.inlineItem}>
            <Feather name="credit-card" size={14} color="#666" />
            <Text style={styles.inlineText}>
              {maskCPF(item.cpfCnpj) || "—"}
            </Text>
          </View>

          <View style={styles.inlineItem}>
            <Feather name="phone" size={14} color="#666" />
            <Text style={styles.inlineText}>
              {maskPhone(item.telefone) || "—"}
            </Text>
          </View>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Email */}
        <View style={styles.emailRow}>
          <Feather name="mail" size={14} color="#666" />
          <Text style={styles.emailText}>{item.email || "—"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Listagem de Clientes" />

      <View style={styles.filtersHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters((prev) => !prev)}
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
            keyboardShouldPersistTaps="handled"
          >
            <ScrollView contentContainerStyle={styles.filtersBox}>
              <Input
                label="Nome"
                value={filters.nome}
                onChangeText={(t) => setFilters((p) => ({ ...p, nome: t }))}
              />
              <Input
                label="Email"
                value={filters.email}
                onChangeText={(t) => setFilters((p) => ({ ...p, email: t }))}
              />
              <Input
                label="CPF/CNPJ"
                value={filters.cpfCnpj}
                onChangeText={(t) => setFilters((p) => ({ ...p, cpfCnpj: t }))}
              />
              <Input
                label="Telefone"
                value={filters.telefone}
                onChangeText={(t) => setFilters((p) => ({ ...p, telefone: t }))}
              />
              <Button title="Aplicar filtros" onPress={aplicarFiltros} />
            </ScrollView>
          </KeyboardAwareScrollView>
        </View>
      )}

      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCliente}
          onEndReached={() => {
            if (!hasMore || loadingMais || loadingInicial) return;
            carregarPagina(page + 1, true);
          }}
          onEndReachedThreshold={0.4}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            resetAndLoad();
          }}
          ListFooterComponent={
            loadingMais ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : null
          }
        />
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

  filtersBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    paddingBottom: 40,
  },

  filtersScroll: { height: "70%", marginTop: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1844a2",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  inlineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  inlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  emailText: {
    fontSize: 13,
    color: "#555",
    flexShrink: 1,
  },
});
