import { TouchableOpacity, TouchableOpacityProps, Text } from "react-native";
import { StyleSheet } from "react-native";
import { useTheme } from "./../contexts/ThemeContext";

type Props = TouchableOpacityProps & {
  title: string;
  onPress?: () => void;
};

export default function Button({ title, ...rest }: Props) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      width: "100%",
      height: 48,
      backgroundColor: theme.buttonBackground,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      fontFamily: "Poppins",
    },
  });
  return (
    <TouchableOpacity activeOpacity={0.4} style={styles.button} {...rest}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
