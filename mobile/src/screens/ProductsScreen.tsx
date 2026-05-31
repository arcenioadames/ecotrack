import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiClient } from '../services/axios';

import { ExportButton } from '../components/products/ExportButton';
import { ExportFormatSelector } from '../components/products/ExportFormatSelector';

interface Product {
  id: string;
  name: string;
  category: { name: string };
  expiryDate: string;
}

type ExportFormat = 'pdf' | 'excel';

type ExportState = {
  exporting: boolean;
  error: string | null;
  success: string | null;
};

const formatProductDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return dateString;
  }
};

const isExpired = (dateString: string): boolean => {
  try {
    return new Date(dateString) < new Date();
  } catch {
    return false;
  }
};

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // HU-14 export states
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exportState, setExportState] = useState<ExportState>({
    exporting: false,
    error: null,
    success: null,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts((response.data?.items ?? []) as Product[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los productos';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  }, [fetchProducts]);

  const base64FromBytes = useCallback((bytes: Uint8Array): string => {
    // Hermes/React Native compatibility: avoid global.btoa.
    // Convert bytes -> base64 using Node's Buffer (safe in React Native runtime with polyfill).
    // This preserves the exact behavior expected by expo-file-system (Base64 string).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const BufferCtor = require('buffer').Buffer as unknown as {
      from: (input: string, encoding?: string) => { toString: (enc: string) => string };
    };

    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return BufferCtor.from(binary, 'binary').toString('base64');
  }, []);


  const parseFileNameFromDisposition = useCallback((disposition: string | undefined): string | null => {
    if (!disposition || typeof disposition !== 'string') return null;
    const match = /filename="?([^";]+)"?/i.exec(disposition);
    return match?.[1] ?? null;
  }, []);

  const handleExport = useCallback(async (format: ExportFormat): Promise<void> => {
    setExportState({ exporting: true, error: null, success: null });

    try {
      const response = await apiClient.get('/products/export', {
        params: { format },
        responseType: 'arraybuffer',
      });

      const contentTypeHeader: unknown = response.headers?.['content-type'];
      const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : undefined;

      const dispositionHeader: unknown = response.headers?.['content-disposition'];
      const fileNameFromHeader = parseFileNameFromDisposition(
        typeof dispositionHeader === 'string' ? dispositionHeader : undefined,
      );

      const bytes = new Uint8Array(response.data as ArrayBuffer);

      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const safeBaseName = fileNameFromHeader
        ? fileNameFromHeader.replace(/\.(pdf|xlsx)$/i, '')
        : 'reporte_inventario';

      const fileName = `${safeBaseName}.${extension}`;
      const base64 = base64FromBytes(bytes);

      const dir = FileSystem.cacheDirectory;
      if (!dir) {
        throw new Error('No se pudo acceder al directorio temporal');
      }

      const uri = `${dir}${fileName}`;

      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        throw new Error('Compartir no está disponible en este dispositivo');
      }

      await Sharing.shareAsync(uri, {
        mimeType: contentType,
        dialogTitle: 'Compartir exportación',
      });

      setExportState({ exporting: false, error: null, success: 'Exportación lista' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al exportar el reporte';
      setExportState({ exporting: false, error: message, success: null });
    }
  }, [base64FromBytes, parseFileNameFromDisposition]);

  const isExporting = exportState.exporting;

  const onPressExport = useCallback(() => {
    setExportState((prev) => ({ ...prev, error: null, success: null }));
    setExportModalVisible(true);
  }, []);

  const onCloseExport = useCallback(() => {
    setExportModalVisible(false);
  }, []);

  const onSelectExportFormat = useCallback(
    (format: ExportFormat) => {
      setExportFormat(format);
      void handleExport(format);
      setExportModalVisible(false);
    },
    [handleExport],
  );

  const empty = products.length === 0;

  const exportStatusBlock = useMemo(() => {
    if (exportState.error) {
      return (
        <View style={styles.exportStatusBox}>
          <Text style={styles.exportErrorTitle}>Error al exportar</Text>
          <Text style={styles.exportErrorMessage}>{exportState.error}</Text>
        </View>
      );
    }

    if (exportState.success) {
      return (
        <View style={styles.exportStatusBox}>
          <Text style={styles.exportSuccessTitle}>{exportState.success}</Text>
        </View>
      );
    }

    if (exportState.exporting) {
      return (
        <View style={styles.exportStatusBox}>
          <ActivityIndicator color="#2e7d32" />
          <Text style={styles.exportInfoText}>Generando archivo...</Text>
        </View>
      );
    }

    return null;
  }, [exportState.error, exportState.success, exportState.exporting]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.exportHeader}>
        <ExportButton onPress={onPressExport} disabled={isExporting} loading={isExporting} />
        <View style={styles.exportStatusWrap}>{exportStatusBlock}</View>
      </View>

      <ExportFormatSelector
        visible={exportModalVisible}
        selectedFormat={exportFormat}
        onSelect={onSelectExportFormat}
        onClose={onCloseExport}
      />

      {empty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay productos</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {products.map((product) => (
            <View
              key={product.id}
              style={[
                styles.productCard,
                isExpired(product.expiryDate) && styles.productCardExpired,
              ]}
            >
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category?.name || 'Sin categoría'}</Text>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Vence:</Text>
                <Text
                  style={[
                    styles.date,
                    isExpired(product.expiryDate) && styles.dateExpired,
                  ]}
                >
                  {formatProductDate(product.expiryDate)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exportStatusWrap: {
    marginTop: 8,
  },
  exportStatusBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
  },
  exportErrorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#d32f2f',
    marginBottom: 4,
  },
  exportErrorMessage: {
    fontSize: 13,
    color: '#555',
  },
  exportSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2e7d32',
  },
  exportInfoText: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  productCardExpired: {
    borderLeftColor: '#d32f2f',
    opacity: 0.7,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  dateExpired: {
    color: '#d32f2f',
  },
});

