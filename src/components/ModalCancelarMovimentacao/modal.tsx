import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Props {
  visible: boolean;
  clienteNome?: string;
  motivo: string;
  onChangeMotivo: (text: string) => void;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ModalCancelarMovimentacao({
  visible,
  clienteNome,
  motivo,
  onChangeMotivo,
  onCancelar,
  onConfirmar,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.modalOverlay} onPress={onCancelar}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <KeyboardAwareScrollView
              enableOnAndroid
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              extraScrollHeight={Platform.OS === "ios" ? 20 : 120}
            >
              <Text style={styles.modalTitle}>Cancelar movimentação</Text>

              <Text style={styles.modalText}>
                Informe o motivo do cancelamento de{" "}
                <Text style={{ fontWeight: "600" }}>{clienteNome}</Text>
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Descreva o motivo"
                multiline
                numberOfLines={4}
                value={motivo}
                onChangeText={onChangeMotivo}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={onCancelar}
                >
                  <Text style={styles.modalCancelText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={() => {
                    if (!motivo.trim()) {
                      Alert.alert(
                        "Atenção",
                        "Informe o motivo do cancelamento",
                      );
                      return;
                    }

                    onConfirmar();
                  }}
                >
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%", // 🔑 evita estourar com teclado
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  modalText: {
    marginBottom: 12,
    color: "#334155",
  },

  modalInput: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12,
  },

  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  modalCancelText: {
    color: "#475569",
    fontWeight: "600",
  },

  modalConfirm: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  modalConfirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
