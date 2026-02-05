import { View, Text, StyleSheet } from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";

export default function Checklist() {
  return (
    <View style={styles.container}>
      <Text>Conteúdo do Painel</Text>

      <BottomTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
