import { View, StyleSheet, Platform, Text } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { usePathname, router, useFocusEffect } from "expo-router";
import { TabItem } from "./TabItem";
import { notificacaoService } from "../../services/notificacaoService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";

const tabs = [
  { label: "Painel", route: "/app/painel", icon: "painel" },
  { label: "Estoque", route: "/app/estoque", icon: "estoque" },
  { label: "Clientes", route: "/app/cliente", icon: "clientes" },
  { label: "Notificações", route: "/app/notificacao", icon: "notificacoes" },
  { label: "Perfil", route: "/app/perfil", icon: "perfil" },
];

export default function BottomTab() {
  const pathname = usePathname();
  const [qtdNaoLidas, setQtdNaoLidas] = useState(0);

  async function carregarQuantidade() {
    try {
      const usuarioId = await AsyncStorage.getItem("@usuarioId");
      const empresaId = await AsyncStorage.getItem("@empresaId");

      if (!usuarioId || !empresaId) return;

      const qtd = await notificacaoService.obterQuantidadeNotificacoesNaoLidas(
        Number(usuarioId),
        Number(empresaId),
      );

      setQtdNaoLidas(qtd.data);
    } catch (error) {}
  }

  useEffect(() => {
    carregarQuantidade();
  }, []);

  // 🔥 atualiza sempre que trocar de tela
  useFocusEffect(
    useCallback(() => {
      carregarQuantidade();
    }, []),
  );

  function renderIcon(name: string, active: boolean) {
    const color = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
    const size = 22;

    if (name === "notificacoes") {
      return (
        <View>
          <Feather name="bell" size={size} color={color} />

          {qtdNaoLidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {qtdNaoLidas > 99 ? "99+" : qtdNaoLidas}
              </Text>
            </View>
          )}
        </View>
      );
    }

    switch (name) {
      case "painel":
        return <Feather name="home" size={size} color={color} />;
      case "estoque":
        return <FontAwesome name="car" size={size} color={color} />;
      case "clientes":
        return <Feather name="users" size={size} color={color} />;
      case "perfil":
        return <Feather name="user" size={size} color={color} />;
      default:
        return <Feather name="circle" size={size} color={color} />;
    }
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <TabItem
            key={tab.route}
            label={tab.label}
            active={isActive}
            icon={renderIcon(tab.icon, isActive)}
            onPress={() => router.replace(tab.route)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 58,
    backgroundColor: "#1844a2",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 30,
    marginBottom: Platform.OS === "android" ? 20 : 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 6 },
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
