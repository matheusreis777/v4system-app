import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";
import {
  notificacaoService,
  NotificacaoDto,
} from "../../services/notificacaoService";
import { router } from "expo-router";

export default function Notificacao() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  async function carregarNotificacoes() {
    try {
      const empresaId = await AsyncStorage.getItem("@empresaId");
      const usuarioId = await AsyncStorage.getItem("@usuarioId");

      const response = await notificacaoService.obter(
        Number(usuarioId),
        Number(empresaId),
      );

      setNotificacoes(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLida(
    id: number,
    lida: boolean,
    referencia?: string,
  ) {
    try {
      if (lida) {
        router.push(`/app/detalhesMovimentacao/${Number(referencia)}`);
        return;
      }

      await notificacaoService.marcarComoLida(id);
      router.push(`/app/detalhesMovimentacao/${Number(referencia)}`);
    } catch (error) {}
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString("pt-BR");
  }

  function renderItem({ item }: { item: NotificacaoDto }) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => marcarComoLida(item.id, item.lida, item.referencia)}
      >
        <View style={[styles.card, !item.lida && styles.cardNaoLido]}>
          <Text style={styles.titulo}>{item.titulo}</Text>

          <Text style={styles.mensagem}>{item.mensagem}</Text>

          <Text style={styles.data}>{formatarData(item.dataCriacao)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <Header title="Notificações" />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#1e88e5" />
        ) : notificacoes.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma notificação encontrada</Text>
        ) : (
          <FlatList
            data={notificacoes}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
          />
        )}

        <BottomTab />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardNaoLido: {
    borderLeftWidth: 5,
    borderLeftColor: "#1e88e5",
  },

  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111",
  },

  mensagem: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },

  data: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },

  vazio: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
});
