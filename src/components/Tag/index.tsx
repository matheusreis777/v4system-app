import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../../styles/fonts";

interface TagProps {
  label: string;
  color: string;
}

export function Tag({ label, color }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.text} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  text: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});
