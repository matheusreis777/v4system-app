import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";
import { Fonts } from "../../styles/fonts";
import Header from "../../components/Header/Header";
import BottomTab from "../../components/BottomTab/BottomTab";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { dashboardService } from "../../services/dashboardService";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<'leads' | 'vehicles'>('leads');

  // Leads Stats
  const [leadsStats, setLeadsStats] = useState({
    total: 0,
    novosHoje: 0,
    agendados: 0,
    vendasMes: 0,
    taxaConversao: 0,
  });

  const [funilData, setFunilData] = useState<any[]>([]);
  const [rankingVendedores, setRankingVendedores] = useState<any[]>([]);
  const [midiasData, setMidiasData] = useState({ labels: [] as string[], quantidades: [] as number[] });

  // Vehicles Stats
  const [vehicleStats, setVehicleStats] = useState({
    estoque: 0,
    investimento: "R$ 0",
    tempoMedio: 0,
    margemProjetada: "R$ 0",
    ticketMedio: "R$ 0",
  });

  const [stockSemaforo, setStockSemaforo] = useState({
    labels: ["Verde", "Amarelo", "Vermelho"],
    quantidades: [0, 0, 0],
    valores: [0, 0, 0]
  });

  const [estoquePorMarca, setEstoquePorMarca] = useState({ labels: [] as string[], quantidades: [] as number[] });

  async function loadDashboard() {
    if (!refreshing) setLoading(true);
    try {
      const name = await AsyncStorage.getItem("@nameUser");
      const empId = await AsyncStorage.getItem("@empresaId");
      
      if (name) setUserName(name);
      if (!empId) return;

      const empresaId = Number(empId);
      const [respVeiculos, respVendas] = await Promise.all([
          dashboardService.obterDashboardVeiculos(empresaId),
          dashboardService.obterDashboardVendas(empresaId)
      ]);

      // --- VEÍCULOS ---
      const dataV = respVeiculos.data || {};
      const kpisV = dataV.kpis || {};
      const graficosV = dataV.graficos || {};
      
      setVehicleStats({
        estoque: kpisV.totalVeiculos || 0,
        investimento: formatCurrency(kpisV.valorTotalInvestido || 0, 0),
        tempoMedio: Math.round(kpisV.tempoMedioEstoque || 0),
        margemProjetada: formatCurrency(kpisV.margemProjetadaTotal || 0, 0),
        ticketMedio: formatCurrency(graficosV.ticketMedioVenda || 0, 0),
      });

      setStockSemaforo({
          labels: graficosV.distribuicaoFaixa?.labels || ["Verde", "Amarelo", "Vermelho"],
          quantidades: graficosV.distribuicaoFaixa?.quantidades || [0, 0, 0],
          valores: graficosV.distribuicaoFaixa?.valoresFinanceiros || [0, 0, 0]
      });

      setEstoquePorMarca({
          labels: graficosV.estoquePorMarca?.labels?.slice(0, 5) || [],
          quantidades: graficosV.estoquePorMarca?.quantidades?.slice(0, 5) || []
      });

      // --- LEADS ---
      const dataVendas = respVendas.data;
      const listaVendas = dataVendas?.lista || [];
      const totalVendas = dataVendas?.total || listaVendas.length;
      
      // Funil por Momento
      const funilMap: any = {
          1: { nome: "Prospectar", cor: "#FF8000", count: 0 },
          2: { nome: "Recepcionar", cor: "#FF9933", count: 0 },
          3: { nome: "Qualificar", cor: "#FFAA66", count: 0 },
          8: { nome: "Orçamento", cor: "#FFBB88", count: 0 },
          4: { nome: "Fechamento", cor: "#FFCCAA", count: 0 },
      };

      listaVendas.forEach((m: any) => {
          if (funilMap[m.momentoId]) funilMap[m.momentoId].count++;
      });

      setFunilData(Object.values(funilMap));

      // Ranking Vendedores
      const vendMap: { [key: string]: { nome: string, vendas: number, total: number } } = {};
      listaVendas.forEach((m: any) => {
          const id = m.vendedorId || 0;
          if (!vendMap[id]) vendMap[id] = { nome: m.vendedorNome || "Sem Vendedor", vendas: 0, total: 0 };
          vendMap[id].total++;
          if (m.statusMovimentacaoId === 171) vendMap[id].vendas++;
      });

      setRankingVendedores(Object.values(vendMap).sort((a, b) => b.vendas - a.vendas).slice(0, 3));

      // Mídias
      const midiasMap: { [key: string]: number } = {};
      listaVendas.forEach((m: any) => {
          const nome = m.cliente?.midiaAtracao?.valorTexto || "Não Informado";
          midiasMap[nome] = (midiasMap[nome] || 0) + 1;
      });
      const labelsM = Object.keys(midiasMap).sort((a, b) => midiasMap[b] - midiasMap[a]).slice(0, 3);
      setMidiasData({ labels: labelsM, quantidades: labelsM.map(l => midiasMap[l]) });

      const hoje = new Date().toISOString().split('T')[0];
      const vFinalizadas = listaVendas.filter((m: any) => m.statusMovimentacaoId === 171).length;
      const vVenda = listaVendas.filter((m: any) => m.tipoNegociacaoId === 1).length;

      setLeadsStats({
        total: totalVendas,
        novosHoje: listaVendas.filter((m: any) => m.dataInclusao && m.dataInclusao.startsWith(hoje)).length,
        agendados: listaVendas.filter((m: any) => m.dataAgendamento).length,
        vendasMes: vFinalizadas,
        taxaConversao: vVenda > 0 ? Math.round((vFinalizadas / vVenda) * 100) : 0,
      });

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  const formatCurrency = (val: number, dec = 2) => {
      return "R$ " + val.toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F0F4F8' }]}>
      <StatusBar barStyle="light-content" />
      <Header 
        title="DASHBOARD" 
        onLeftPress={() => router.replace("/app/intro")}
        leftIcon="grid"
        rightIcons={[{ icon: "bell", onPress: () => router.push("/app/notificacao") }]}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <View style={styles.tabContainer}>
           <View style={styles.tabBar}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'leads' && styles.tabActive]} 
                onPress={() => setActiveTab('leads')}
              >
                <Text style={[styles.tabLabel, activeTab === 'leads' && styles.tabLabelActive]}>LEADS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'vehicles' && styles.tabActive]} 
                onPress={() => setActiveTab('vehicles')}
              >
                <Text style={[styles.tabLabel, activeTab === 'vehicles' && styles.tabLabelActive]}>VEÍCULOS</Text>
              </TouchableOpacity>
           </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loaderText}>Sincronizando métricas...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {activeTab === 'leads' ? (
              <>
                <View style={styles.grid}>
                   <KpiCard label="Total Leads" value={leadsStats.total} icon="users" color={theme.primary} />
                   <KpiCard label="Novos Hoje" value={leadsStats.novosHoje} icon="plus-circle" color="#10B981" />
                   <KpiCard label="Vendas" value={leadsStats.vendasMes} icon="shopping-bag" color="#F43F5E" />
                   <KpiCard label="Conversão" value={`${leadsStats.taxaConversao}%`} icon="target" color="#F59E0B" />
                </View>

                {/* FUNIL DE VENDAS */}
                <Section title="Funil de Vendas" subtitle="Etapas atuais do pipeline">
                   <View style={styles.funnelContainer}>
                      {funilData.map((item, index) => (
                        <View key={item.nome} style={[styles.funnelStep, { width: `${100 - (index * 8)}%`, backgroundColor: item.cor }]}>
                           <Text style={styles.funnelLabel}>{item.nome}</Text>
                           <Text style={styles.funnelValue}>{item.count}</Text>
                        </View>
                      ))}
                   </View>
                </Section>

                {/* RANKING VENDEDORES */}
                <Section title="Ranking Performance" subtitle="Top 3 vendedores por conversão">
                   <View style={styles.rankingBox}>
                      {rankingVendedores.map((v, i) => (
                        <View key={v.nome} style={styles.rankingRow}>
                           <View style={styles.rankingRank}><Text style={styles.rankText}>{i+1}º</Text></View>
                           <Text style={styles.rankingName} numberOfLines={1}>{v.nome}</Text>
                           <View style={styles.rankingStats}>
                              <Text style={styles.rankVendas}>{v.vendas} vendas</Text>
                              <Text style={styles.rankTotal}>de {v.total}</Text>
                           </View>
                        </View>
                      ))}
                   </View>
                </Section>

                {/* MÍDIAS */}
                <Section title="Mídias de Atração" subtitle="Volume por canal">
                   {midiasData.labels.map((label, idx) => (
                      <View key={label} style={styles.progressRow}>
                         <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>{label}</Text>
                            <Text style={styles.progressVal}>{midiasData.quantidades[idx]}</Text>
                         </View>
                         <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${(midiasData.quantidades[idx] / (leadsStats.total || 1)) * 100}%`, backgroundColor: theme.primary }]} />
                         </View>
                      </View>
                   ))}
                </Section>
              </>
            ) : (
              <>
                <View style={styles.grid}>
                   <KpiCard label="Estoque" value={vehicleStats.estoque} icon="truck" color={theme.primary} />
                   <KpiCard label="Ticket Médio" value={vehicleStats.ticketMedio} icon="tag" color="#8B5CF6" smallValue />
                   <KpiCard label="Giro Médio" value={`${vehicleStats.tempoMedio}d`} icon="clock" color="#10B981" />
                   <KpiCard label="Margem" value={vehicleStats.margemProjetada} icon="trending-up" color="#F43F5E" smallValue />
                </View>

                {/* INVESTIMENTO TOTAL */}
                <LinearGradient colors={[theme.primary, theme.mode === 'light' ? '#FF9933' : '#CC6600']} style={styles.investCard}>
                   <Text style={styles.investLabel}>INVESTIMENTO TOTAL EM PÁTIO</Text>
                   <Text style={styles.investValue}>{vehicleStats.investimento}</Text>
                   <MaterialCommunityIcons name="shield-check" size={60} color="rgba(255,255,255,0.1)" style={styles.investIcon} />
                </LinearGradient>

                {/* SEMÁFORO */}
                <Section title="Semáforo de Estoque" subtitle="Distribuição por idade">
                   <View style={styles.semaforoRow}>
                      {stockSemaforo.labels.map((l, i) => (
                         <View key={l} style={styles.semItem}>
                            <View style={[styles.semDot, { backgroundColor: i === 0 ? '#10B981' : i === 1 ? '#F59E0B' : '#EF4444' }]} />
                            <Text style={styles.semCount}>{stockSemaforo.quantidades[i]} u.</Text>
                            <Text style={styles.semName}>{l}</Text>
                         </View>
                      ))}
                   </View>
                </Section>

                {/* MARCAS */}
                <Section title="Estoque por Marca" subtitle="Principais marcas em pátio">
                   <View style={styles.brandsBox}>
                      {estoquePorMarca.labels.map((l, i) => (
                        <View key={l} style={styles.brandRow}>
                           <Text style={styles.brandName}>{l}</Text>
                           <Text style={styles.brandCount}>{estoquePorMarca.quantidades[i]} veíc.</Text>
                        </View>
                      ))}
                   </View>
                </Section>
              </>
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FLOATING REFRESH BUTTON */}
      <TouchableOpacity style={styles.refreshFab} onPress={onRefresh}>
        <LinearGradient colors={[theme.primary, theme.mode === 'light' ? '#FF9933' : '#CC6600']} style={styles.fabGradient}>
          <MaterialCommunityIcons name="sync" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <BottomTab />
    </View>
  );
}

function KpiCard({ label, value, icon, color, smallValue }: any) {
  return (
    <View style={styles.kpiCard}>
       <View style={[styles.kpiIcon, { backgroundColor: color + '15' }]}>
          <Feather name={icon} size={18} color={color} />
       </View>
       <Text style={[styles.kpiValue, smallValue && { fontSize: 16 }]}>{value}</Text>
       <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, subtitle, children }: any) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  tabContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#fff', elevation: 2, shadowOpacity: 0.1 },
  tabLabel: { fontSize: 12, fontFamily: Fonts.bold, color: '#64748B' },
  tabLabelActive: { color: '#0F172A' },
  loader: { height: 400, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#64748B', fontFamily: Fonts.medium },
  content: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpiCard: {
    backgroundColor: '#fff',
    width: (width / 2) - 22,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  kpiValue: { fontSize: 22, fontFamily: Fonts.condensedBold, color: '#0F172A' },
  kpiLabel: { fontSize: 11, color: '#64748B', marginTop: 2, fontFamily: Fonts.medium },
  section: { marginTop: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.bold, color: '#0F172A' },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  sectionContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 1, shadowOpacity: 0.03 },
  funnelContainer: { alignItems: 'center', gap: 6 },
  funnelStep: { 
    height: 44, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16,
  },
  funnelLabel: { color: '#fff', fontSize: 12, fontFamily: Fonts.bold },
  funnelValue: { color: '#fff', fontSize: 14, fontFamily: Fonts.condensedBold },
  rankingBox: { gap: 12 },
  rankingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankingRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 10, fontFamily: Fonts.bold, color: '#0F172A' },
  rankingName: { flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: '#334155' },
  rankingStats: { alignItems: 'flex-end' },
  rankVendas: { fontSize: 13, fontFamily: Fonts.bold, color: '#10B981' },
  rankTotal: { fontSize: 10, color: '#94A3B8' },
  progressRow: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontFamily: Fonts.medium, color: '#334155' },
  progressVal: { fontSize: 13, fontFamily: Fonts.bold, color: '#0F172A' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  investCard: { borderRadius: 20, padding: 24, marginBottom: 24, overflow: 'hidden' },
  investLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.bold, letterSpacing: 1 },
  investValue: { fontSize: 32, color: '#fff', fontFamily: Fonts.condensedBold, marginTop: 4 },
  investIcon: { position: 'absolute', bottom: -10, right: -10 },
  semaforoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  semItem: { alignItems: 'center', flex: 1 },
  semDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 8 },
  semCount: { fontSize: 18, fontFamily: Fonts.condensedBold, color: '#0F172A' },
  semName: { fontSize: 10, color: '#64748B', fontFamily: Fonts.bold },
  brandsBox: { gap: 10 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  brandName: { fontSize: 14, fontFamily: Fonts.medium, color: '#334155' },
  brandCount: { fontSize: 14, fontFamily: Fonts.bold, color: '#0F172A' },
  refreshFab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
