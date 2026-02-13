import { View, Text, StyleSheet } from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import Header from "../../components/Header/Header";

export default function Checklist() {
  return (
    <View style={styles.screen}>
      <Header title="Checklist de Veículos" />

      <View style={styles.container}></View>

      <BottomTab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e6e8ea" },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
