import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type ExportFormat = 'pdf' | 'excel';

export type ExportFormatSelectorProps = {
  visible: boolean;
  selectedFormat?: ExportFormat;
  onSelect: (format: ExportFormat) => void;
  onClose: () => void;
};

export function ExportFormatSelector({
  visible,
  onSelect,
  onClose,
  selectedFormat,
}: ExportFormatSelectorProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Selecciona formato</Text>

          <TouchableOpacity
            style={[styles.option, selectedFormat === 'pdf' && styles.optionSelected]}
            onPress={() => onSelect('pdf')}
          >
            <Text style={styles.optionText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, selectedFormat === 'excel' && styles.optionSelected]}
            onPress={() => onSelect('excel')}
          >
            <Text style={styles.optionText}>XLSX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    borderColor: '#2e7d32',
    backgroundColor: 'rgba(46,125,50,0.08)',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '700',
  },
});

