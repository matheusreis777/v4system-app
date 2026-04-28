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
import { Fonts } from "../../../styles/fonts";
import { useTheme } from "../../../contexts/ThemeContext";

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

  const rawVeiculo = dadosVeiculos ? JSON.parse(dadosVeiculos) : null;

  // Normalização para o componente (Suporte a camelCase e PascalCase)
  const m = rawVeiculo?.modelo || rawVeiculo?.Modelo;
  const brand = rawVeiculo?.marca || rawVeiculo?.Marca || m?.marca?.nome || m?.Marca?.Nome || "";
  const model = rawVeiculo?.modeloNome || rawVeiculo?.ModeloNome || m?.nome || m?.Nome || rawVeiculo?.modelo || rawVeiculo?.Modelo || "";

  const veiculo = rawVeiculo ? {
    id: rawVeiculo.id || rawVeiculo.Id,
    placa: rawVeiculo.placa || rawVeiculo.Placa || "",
    statusVeiculo: rawVeiculo.statusVeiculoNome || rawVeiculo.StatusVeiculoNome || rawVeiculo.statusVeiculo || "—",
    tipoVeiculo: rawVeiculo.tipoVeiculoDescricao || rawVeiculo.TipoVeiculoDescricao || rawVeiculo.tipoVeiculo || "—",
    marcaModelo: rawVeiculo.marcaModelo || rawVeiculo.MarcaModelo || `${brand} ${model}`.trim() || "—",
    anoModelo: rawVeiculo.anoModelo || rawVeiculo.AnoModelo || 0,
    anoFabricacao: rawVeiculo.anoFabricacao || rawVeiculo.AnoFabricacao || 0,
    km: rawVeiculo.quilometragem || rawVeiculo.Quilometragem || rawVeiculo.km || 0,
    cor: rawVeiculo.corNome || rawVeiculo.CorNome || rawVeiculo.cor || "—",
    combustivel: rawVeiculo.combustivelNome || rawVeiculo.CombustivelNome || rawVeiculo.combustivel || "—",
    valorVenda: rawVeiculo.valorVenda || rawVeiculo.ValorVenda || rawVeiculo.resumoGeral?.valorVenda || rawVeiculo.ResumoGeral?.ValorVenda || 0
  } : null;

  const formatCurrency = (val: number) => {
    if (!val) return "R$ 0,00";
    return "R$ " + val.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [questionarios, setQuestionarios] = useState<QuestionarioPorEmpresa[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Header
        title="Dados do Veículo"
        leftIcon="chevron-left"
        onLeftPress={() => router.replace("/app/estoque")}
      />

      <View style={styles.container}>
        {veiculo && (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={[styles.placa, { fontFamily: Fonts.condensedBold, color: theme.primary }]}>{maskPlate(veiculo.placa)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.mode === "light" ? "#EDF0F4" : "#1A4480" }]}>
                <Text style={[styles.statusText, { color: theme.text, fontFamily: Fonts.medium }]}>
                   {(veiculo.statusVeiculo || "").toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={[styles.title, { fontFamily: Fonts.bold, color: theme.text }]}>
               {veiculo.marcaModelo}
            </Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>ANO</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts.medium, color: theme.text }]}>
                  {veiculo.anoModelo}/{veiculo.anoFabricacao}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>KM</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts.medium, color: theme.text }]}>
                  {veiculo.km?.toLocaleString() || "0"} km
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>COR</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts.medium, color: theme.text }]}>{veiculo.cor}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>COMBUSTÍVEL</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts.medium, color: theme.text }]}>{veiculo.combustivel}</Text>
              </View>

              <View style={styles.infoItemValor}>
                <Text style={[styles.infoLabel, { fontFamily: Fonts.bold, color: theme.primary }]}>VALOR VENDA</Text>
                <Text style={[styles.infoValue, { color: theme.accent, fontFamily: Fonts.condensedBold, fontSize: 18 }]}>
                  {formatCurrency(veiculo.valorVenda)}
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
    fontSize: 10,
    letterSpacing: 1,
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
  infoLabel: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoValue: { fontSize: 14 },
});
