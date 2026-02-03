import { View, StyleSheet } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { TabItem } from "./TabItem";

const tabs = [
  { label: "Painel", route: "/painel", icon: "painel" },
  { label: "Estoque", route: "/estoque", icon: "estoque" },
  { label: "Clientes", route: "/cliente", icon: "clientes" },
  { label: "Checklist", route: "/checklist", icon: "checklist" },
  { label: "Perfil", route: "/perfil", icon: "perfil" },
];

function renderIcon(name: string, active: boolean) {
  const color = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
  const size = 22;

  switch (name) {
    case "painel":
      return <Feather name="home" size={size} color={color} />;
    case "estoque":
      return <FontAwesome name="car" size={size} color={color} />;
    case "clientes":
      return <Feather name="users" size={size} color={color} />;
    case "checklist":
      return <Feather name="check-square" size={size} color={color} />;
    case "perfil":
      return <Feather name="user" size={size} color={color} />;
    default:
      return <Feather name="circle" size={size} color={color} />;
  }
}

export default function BottomTab() {
  const pathname = usePathname();

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
    zIndex: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 30,
    marginBottom: 20,
    marginHorizontal: 10,

    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 6 },
  },
});
