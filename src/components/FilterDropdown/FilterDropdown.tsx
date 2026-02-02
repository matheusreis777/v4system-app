import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState } from "react";

export interface LookupItem {
  id: number;
  nome: string;
}

interface FilterDropdownProps {
  label: string;
  options: LookupItem[];
  value?: number;
  onChange: (id: number | undefined) => void;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.id === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.nome ?? "Selecione..."}
        </Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modal}>
            {options.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.option}
                onPress={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },

  field: {
    height: 52,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },

  value: {
    fontSize: 15,
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  optionText: {
    fontSize: 16,
    color: "#0F172A",
  },
});
