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
    comVeiculo: 0,
    vendedoresAtivos: 0,
    taxaConversao: 0,
  });

  // Vehicles Stats
  const [vehicleStats, setVehicleStats] = useState({
    estoque: 0,
    investimento: "R$ 0,00",
    tempoMedio: 0,
    margemProjetada: "R$ 0,00",
  });

  const [stockSemaforo, setStockSemaforo] = useState({
    labels: ["Verde", "Amarelo", "Vermelho"],
    quantidades: [0, 0, 0],
    valores: [0, 0, 0]
  });

  async function loadDashboard() {
    setLoading(true);
    try {
      const name = await AsyncStorage.getItem("@nameUser");
      const empId = await AsyncStorage.getItem("@empresaId");
      
      if (name) setUserName(name);
      
      if (empId) {
        const empresaId = Number(empId);
        
        const [respVeiculos, respVendas] = await Promise.all([
            dashboardService.obterDashboardVeiculos(empresaId),
            dashboardService.obterDashboardVendas(empresaId)
        ]);

        const dataV = respVeiculos.data || {};
        const kpisV = dataV.kpis || {};
        const graficosV = dataV.graficos || {};
        const semaforo = graficosV.distribuicaoFaixa || {};

        setVehicleStats({
          estoque: kpisV.totalVeiculos || 0,
          investimento: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpisV.valorTotalInvestido || 0),
          tempoMedio: Math.round(kpisV.tempoMedioEstoque || 0),
          margemProjetada: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpisV.margemProjetadaTotal || 0),
        });

        if (semaforo.quantidades) {
            setStockSemaforo({
                labels: semaforo.labels || ["Verde", "Amarelo", "Vermelho"],
                quantidades: semaforo.quantidades || [0, 0, 0],
                valores: semaforo.valoresFinanceiros || [0, 0, 0]
            });
        }

        const dataVendas = respVendas.data;
        const listaVendas = dataVendas?.lista || [];
        const totalVendas = dataVendas?.total || listaVendas.length;
        const comVeiculo = listaVendas.filter((m: any) => m.veiculoVinculado).length;
        const vendedoresAtivos = new Set(listaVendas.map((m: any) => m.vendedorId)).size;
        const vVenda = listaVendas.filter((m: any) => m.tipoNegociacaoId === 1).length; 
        const vFinalizadas = listaVendas.filter((m: any) => m.statusMovimentacaoId === 171).length;
        
        setLeadsStats({
          total: totalVendas,
          comVeiculo: comVeiculo,
          vendedoresAtivos: vendedoresAtivos,
          taxaConversao: vVenda > 0 ? Math.round((vFinalizadas / vVenda) * 100) : 0,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" />
      <Header 
        title="CENTRAL DE MÉTRICAS" 
        onLeftPress={() => router.replace("/app/intro")}
        leftIcon="briefcase"
        rightIcons={[{ icon: "bell", onPress: () => router.push("/app/notificacao") }]}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8000" />}
      >
      {/* Tab Switcher (Reverted to Pill style with Icons) */}
      <View style={[styles.tabBar, { backgroundColor: theme.mode === 'light' ? '#f8f9fa' : '#1e293b' }]}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'leads' && styles.tabItemActive]} 
          onPress={() => setActiveTab('leads')}
        >
          <MaterialCommunityIcons 
            name="chart-timeline-variant" 
            size={18} 
            color={activeTab === 'leads' ? theme.accent : '#94a3b8'} 
          />
          <Text style={[styles.tabText, activeTab === 'leads' && { color: theme.accent, fontFamily: Fonts.bold }]}>LEADS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'vehicles' && styles.tabItemActive]} 
          onPress={() => setActiveTab('vehicles')}
        >
          <MaterialCommunityIcons 
            name="car-multiple" 
            size={18} 
            color={activeTab === 'vehicles' ? theme.accent : '#94a3b8'} 
          />
          <Text style={[styles.tabText, activeTab === 'vehicles' && { color: theme.accent, fontFamily: Fonts.bold }]}>VEÍCULOS</Text>
        </TouchableOpacity>
      </View>

        {/* WELCOME AREA */}
        <View style={styles.welcomeArea}>
           <Text style={styles.monthLabel}>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</Text>
           <Text style={styles.mainTitle}>{activeTab === 'leads' ? "Performance Comercial" : "Visão de Pátio"}</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#FF8000" />
          </View>
        ) : (
          <View style={styles.grid}>
            {activeTab === 'leads' ? (
              <>
                <KpiGridTile 
                  label="Total Leads" 
                  value={leadsStats.total} 
                  icon="activity" 
                  color="#6366F1"
                />
                <KpiGridTile 
                  label="Com Veículo" 
                  value={leadsStats.comVeiculo} 
                  icon="link" 
                  color="#0EA5E9"
                />
                <KpiGridTile 
                  label="Vend. Ativos" 
                  value={leadsStats.vendedoresAtivos} 
                  icon="users" 
                  color="#10B981"
                />
                <KpiGridTile 
                  label="Conversão" 
                  value={`${leadsStats.taxaConversao}%`} 
                  icon="target" 
                  color="#F43F5E"
                />
              </>
            ) : (
              <>
                <KpiGridTile 
                  label="Em Estoque" 
                  value={vehicleStats.estoque} 
                  icon="truck" 
                  color="#6366F1"
                />
                <KpiGridTile 
                  label="Investimento" 
                  value={vehicleStats.investimento} 
                  icon="dollar-sign" 
                  color="#F43F5E"
                  smallValue
                />
                <KpiGridTile 
                  label="Giro" 
                  value={`${vehicleStats.tempoMedio}d`} 
                  icon="repeat" 
                  color="#10B981"
                />
                <KpiGridTile 
                  label="Margem Total" 
                  value={vehicleStats.margemProjetada} 
                  icon="trending-up" 
                  color="#0EA5E9"
                  smallValue
                />

                {/* SEMÁFORO DE ESTOQUE */}
                <View style={styles.semaforoWrapper}>
                   <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Semáforo de Estoque</Text>
                      <Text style={styles.sectionSubtitle}>Distribuição por dias em pátio</Text>
                   </View>
                   
                   <View style={styles.semaforoRow}>
                      <SemaforoCard 
                         label="0-30 DIAS" 
                         count={stockSemaforo.quantidades[0]} 
                         value={stockSemaforo.valores[0]} 
                         color="#10B981" 
                         type="Verde"
                      />
                      <SemaforoCard 
                         label="31-60 DIAS" 
                         count={stockSemaforo.quantidades[1]} 
                         value={stockSemaforo.valores[1]} 
                         color="#F59E0B" 
                         type="Amarelo"
                      />
                      <SemaforoCard 
                         label="61+ DIAS" 
                         count={stockSemaforo.quantidades[2]} 
                         value={stockSemaforo.valores[2]} 
                         color="#EF4444" 
                         type="Vermelho"
                      />
                   </View>
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING REFRESH BUTTON */}
      <TouchableOpacity style={styles.refreshFab} onPress={onRefresh}>
        <LinearGradient colors={["#061D3D", "#1A4480"]} style={styles.fabGradient}>
          <MaterialCommunityIcons name="sync" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <BottomTab />
    </View>
  );
}

function KpiGridTile({ label, value, icon, color, smallValue }: any) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIndicator, { backgroundColor: color }]} />
      <View style={styles.tileContent}>
        <View style={styles.tileHeader}>
           <View style={[styles.tileIconBox, { backgroundColor: color + '10' }]}>
              <Feather name={icon} size={14} color={color} />
           </View>
           <Feather name="chevron-right" size={14} color="#CBD5E1" />
        </View>
        <Text style={[styles.tileValue, smallValue && { fontSize: 20 }]}>{value}</Text>
        <Text style={styles.tileLabel}>{label.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function SemaforoCard({ label, count, value, color, type }: any) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <View style={[styles.semCard, { borderColor: color + '30' }]}>
       <View style={[styles.semDot, { backgroundColor: color }]} />
       <Text style={styles.semLabel}>{label}</Text>
       <Text style={[styles.semCount, { color: color }]}>{count} und</Text>
       <Text style={styles.semValue}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  tabBar: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  welcomeArea: {
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: '#FF8000',
    fontFamily: Fonts.bold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    color: '#061D3D',
    fontFamily: Fonts.condensedBold,
  },
  loader: {
    marginTop: 60,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: (width / 2) - 18,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tileIndicator: {
    height: 4,
    width: '100%',
  },
  tileContent: {
    padding: 16,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tileIconBox: {
    padding: 6,
    borderRadius: 8,
  },
  tileValue: {
    fontSize: 24,
    color: '#061D3D',
    fontFamily: Fonts.condensedBold,
  },
  semaforoWrapper: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#061D3D',
    fontFamily: Fonts.bold,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Fonts.regular,
  },
  semaforoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  semCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  semDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  semLabel: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  semCount: {
    fontSize: 18,
    fontFamily: Fonts.condensedBold,
    marginBottom: 2,
  },
  semValue: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
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
