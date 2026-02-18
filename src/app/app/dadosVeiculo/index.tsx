import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import BottomTab from "../../../components/BottomTab/BottomTab";
import Header from "../../../components/Header/Header";
import { useLocalSearchParams, router } from "expo-router";
import { questionarioService } from "../../../services/questionarioService";
import { maskPlate } from "../../../utils/masks";

interface QuestionarioPorEmpresa {
  id: number;
  nome: string;
  codigo: number;
}

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

export default function Checklist() {
  const params = useLocalSearchParams();

  const { veiculoId, empresaId, dadosVeiculos } = useLocalSearchParams<{
    veiculoId?: string;
    empresaId?: string;
    dadosVeiculos?: string;
  }>();

  const veiculo: Veiculo | null = dadosVeiculos
    ? JSON.parse(dadosVeiculos)
    : null;

  const [questionarios, setQuestionarios] = useState<QuestionarioPorEmpresa[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  // 🔹 carregar empresaId
  useEffect(() => {
    if (!empresaId || !veiculoId) return;

    async function carregarQuestionarios() {
      try {
        setLoading(true);

        const resposta = await questionarioService.listaQuestionario(
          0,
          Number(empresaId),
        );

        setQuestionarios(resposta);
      } catch (error) {
        console.log("ERRO API:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarQuestionarios();
  }, [empresaId, veiculoId]);

  function handleSelecionarChecklist(item: QuestionarioPorEmpresa) {
    router.push({
      pathname: "/app/checklist-dinamico",
      params: {
        questionarioId: item.id,
        empresaId: empresaId ? Number(empresaId) : 0,
        veiculoId: veiculoId ? Number(veiculoId) : 0,
        codigoQuestionario: item.codigo,
      },
    });
  }

  return (
    <View style={styles.screen}>
      <Header
        title="Dados do Veículo"
        leftIcon="chevron-left"
        onLeftPress={() => router.replace("/app/estoque")}
      />

      <View style={styles.container}>
        {veiculo && (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.placa}>{maskPlate(veiculo.placa)}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{veiculo.statusVeiculo}</Text>
              </View>
            </View>

            <Text style={styles.title}>
              {veiculo.tipoVeiculo} • {veiculo.marca} {veiculo.modelo}
            </Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ano</Text>
                <Text style={styles.infoValue}>
                  {veiculo.anoModelo}/{veiculo.anoFabricacao}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>KM</Text>
                <Text style={styles.infoValue}>
                  {veiculo.km.toLocaleString()} km
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cor</Text>
                <Text style={styles.infoValue}>{veiculo.cor}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Combustível</Text>
                <Text style={styles.infoValue}>{veiculo.combustivel}</Text>
              </View>

              <View style={styles.infoItemValor}>
                <Text style={styles.infoLabel}>Valor Venda</Text>
                <Text style={styles.infoValue}>
                  R${" "}
                  {veiculo.valorVenda?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={questionarios}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.botao}
                onPress={() => handleSelecionarChecklist(item)}
              >
                <Text style={styles.botaoTexto}>{item.nome}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum checklist encontrado.</Text>
            }
          />
        )} */}
      </View>

      <BottomTab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#e6e8ea",
  },
  container: {
    flex: 1,
  },
  veiculoCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },

  placa: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1844a2",
  },

  modelo: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  info: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  botao: {
    backgroundColor: "#1844a2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

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
});
