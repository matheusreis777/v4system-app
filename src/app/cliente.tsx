import { View, Text, StyleSheet } from "react-native";
import BottomTab from "../components/BottomTab/BottomTab";
import Header from "../components/Header/Header";
import { router } from "expo-router";

export default function Painel() {
  return (
    <>
      <Header
        title="Clientes"
        rightIcons={[
          {
            icon: "filter",
            onPress: () => router.push("/configuracoes"),
          },
        ]}
      />

      <View style={styles.container}>
        <Text>Conteúdo do Painel</Text>

        <BottomTab />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
