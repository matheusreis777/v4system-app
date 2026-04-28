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
      height: 50,
      backgroundColor: theme.buttonBackground,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.buttonBackground,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    title: {
      color: theme.buttonText,
      fontSize: 16,
      fontFamily: "Barlow-Bold",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
  });
  return (
    <TouchableOpacity activeOpacity={0.4} style={styles.button} {...rest}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
