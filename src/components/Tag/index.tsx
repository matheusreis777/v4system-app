import { View, Text, StyleSheet } from "react-native";

interface TagProps {
  label: string;
  color: string;
}

export function Tag({ label, color }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});
