import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMemo, useState } from "react";

export interface LookupItem {
  id: number;
  nome: string;
}

interface FilterDropdownProps {
  label: string;
  options: LookupItem[];
  value?: number;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((o) => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    return options.filter((item) =>
      item.nome.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  function handleSelect(id: number) {
    onChange(id);
    setSearch("");
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.field}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.nome ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.backdrop}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modal}
              onPress={() => {}}
            >
              {/* 🔍 Busca */}
              <View style={styles.searchBox}>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                />
              </View>

              {/* 📜 Lista */}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item.id)}
                  >
                    <Text style={styles.optionText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Nenhum resultado encontrado
                  </Text>
                }
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
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
  },

  value: {
    fontSize: 15,
    color: "#0F172A",
    flex: 1,
  },

  placeholder: {
    color: "#94A3B8",
  },

  chevron: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 8,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "70%", // 🔑 evita modal gigante
    overflow: "hidden",
  },

  searchBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  searchInput: {
    height: 44,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#0F172A",
  },

  list: {
    paddingHorizontal: 4,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  optionText: {
    fontSize: 16,
    color: "#0F172A",
  },

  emptyText: {
    textAlign: "center",
    paddingVertical: 20,
    color: "#94A3B8",
    fontSize: 14,
  },
});
