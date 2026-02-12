import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import { detalheMovimentacaoService } from "../../../services/detalheMovimentacaoService";
import { maskData, maskPhone } from "../../../utils/masks";

export default function DetalhesMovimentacao() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [detalhes, setDetalhes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function carregarDetalhes(idNumber: number) {
    try {
      const response = await detalheMovimentacaoService.listar(idNumber);

      if (response?.length > 0) {
        setDetalhes(response[0]);
      } else {
        setDetalhes(null);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    const idNumber = Number(id);
    if (isNaN(idNumber)) return;

    carregarDetalhes(idNumber);
  }, [id]);

  function renderCampo(label: string, value?: string | number | Date) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value ? String(value) : "-"}</Text>
      </View>
    );
  }

  function renderLinhaTabela(texto?: string) {
    return (
      <View style={styles.tableRow}>
        <Text style={styles.tableText}>{texto || "-"}</Text>
      </View>
    );
  }

  // ---------- LOADING ----------
  if (loading) {
    return (
      <View style={styles.screen}>
        <Header
          title="Detalhes da Movimentação"
          leftIcon="chevron-left"
          onLeftPress={() => router.replace("/app/painel")}
        />
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <View style={styles.screen}>
      <Header
        title="Detalhes da Movimentação"
        leftIcon="chevron-left"
        onLeftPress={() => router.replace("/app/painel")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CARD GERAL */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            {renderCampo("ID", id)}
            {renderCampo("Status", detalhes?.statusMovimentacao)}
          </View>

          <View style={styles.rowBetween}>
            {renderCampo("Momento", detalhes?.momentoMovimentacao)}
          </View>

          <View style={styles.rowBetween}>
            {renderCampo("Data Inicial", maskData(detalhes?.dataInicial))}
            {renderCampo(
              "Última Alteração",
              maskData(detalhes?.ultimaAlteracao),
            )}
          </View>
        </View>

        {/* RECEPCIONAR */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recepcionar</Text>

          <View style={styles.rowBetween}>
            {renderCampo("Nome do Lead", detalhes?.nome)}
            {renderCampo("Telefone", maskPhone(detalhes?.telefone))}
          </View>

          <View style={styles.rowBetween}>
            {renderCampo("Tipo da Negociação", detalhes?.tipoNegociacao)}
            {renderCampo("Mídia de Atração", detalhes?.midiaAtracao)}
          </View>

          <View style={styles.rowBetween}>
            {renderCampo("Fluxo", detalhes?.fluxo)}
            {renderCampo(
              "Data de Agendamento",
              maskData(detalhes?.dataAgendamento),
            )}
          </View>
        </View>

        {/* QUALIFICAR */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Qualificar</Text>

          <Text style={styles.subTitle}>Veículos</Text>
          {(detalhes?.veiculos?.length ?? 0) > 0
            ? detalhes.veiculos.map((v: string, i: number) => (
                <View key={i}>{renderLinhaTabela(v)}</View>
              ))
            : renderLinhaTabela("-")}

          <Text style={styles.subTitle}>Cliente</Text>
          {renderLinhaTabela(detalhes?.cliente)}
        </View>

        {/* TERCEIROS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Terceiros</Text>

          {(detalhes?.terceiros?.length ?? 0) > 0
            ? detalhes.terceiros.map((t: string, i: number) => (
                <View key={i}>{renderLinhaTabela(t)}</View>
              ))
            : renderLinhaTabela("-")}
        </View>

        {/* HISTÓRICO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Histórico da Movimentação</Text>

          {(detalhes?.historicoMovimentacao?.length ?? 0) > 0 ? (
            detalhes.historicoMovimentacao.map(
              (item: string, index: number) => (
                <View key={index}>{renderLinhaTabela(item)}</View>
              ),
            )
          ) : (
            <Text style={styles.value}>-</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },

  scrollContent: {
    paddingBottom: 32,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1844a2",
    marginBottom: 12,
  },

  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#333",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  field: {
    marginBottom: 10,
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#777",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  tableRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  tableText: {
    fontSize: 13,
    color: "#333",
  },
});
