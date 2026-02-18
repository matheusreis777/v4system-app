import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import BottomTab from "../../../components/BottomTab/BottomTab";
import Header from "../../../components/Header/Header";
import { useLocalSearchParams, router } from "expo-router";
import { avaliacaoService } from "../../../services/avaliacaoService";
import { questionarioService } from "../../../services/questionarioService";

interface ChecklistItem {
  id: number;
  pergunta: string;
  resposta: string;
}

export default function ChecklistDinamico() {
  const params = useLocalSearchParams();

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarChecklist() {
      try {
        setLoading(true);

        console.log("Carregando checklist para:", params);

        const avaliacao = await avaliacaoService.obterAvaliacaoPorVeiculo(
          Number(params.veiculoId),
          Number(params.empresaId),
        );

        if (!avaliacao?.respostasQuestionarios) {
          setChecklist([]);
          return;
        }

        // 🔥 transforma as respostas em lista para o FlatList
        const lista: ChecklistItem[] = avaliacao.respostasQuestionarios.map(
          (item: any, index: number) => ({
            id: index,
            pergunta: `Questão ${item.questaoId}`,
            resposta: item.valorResposta ?? "Não respondido",
          }),
        );

        console.log(params.codigo);

        const teste = await questionarioService.listaQuestionarioDinamico(
          Number(params.codigo),
          Number(params.empresaId),
        );

        console.log(teste);

        setChecklist(lista);
      } catch (error) {
        console.log("ERRO API:", error);
        Alert.alert("Erro", "Não foi possível carregar o checklist");
      } finally {
        setLoading(false);
      }
    }

    carregarChecklist();
  }, []);

  return (
    <View style={styles.screen}>
      <Header
        title="Checklist de Avaliação"
        leftIcon="chevron-left"
        onLeftPress={() => router.back()}
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={checklist}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.pergunta}>{item.pergunta}</Text>

                <View style={styles.respostaBox}>
                  <Text style={styles.respostaLabel}>Resposta</Text>
                  <Text style={styles.respostaTexto}>{item.resposta}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum checklist encontrado.</Text>
            }
          />
        )}
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

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  pergunta: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },

  respostaBox: {
    backgroundColor: "#f1f4f8",
    padding: 12,
    borderRadius: 8,
  },

  respostaLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  respostaTexto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1844a2",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});
