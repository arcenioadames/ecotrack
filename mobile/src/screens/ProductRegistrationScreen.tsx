import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';

import { useCategories } from '../hooks/useCategories';
import { useScannerState } from '../hooks/useScannerState';
import { productApi } from '../services/productApi';
import {
  productRegistrationSchema,
  type ProductRegistrationFormData,
} from '../validators/productRegistration.validator';

interface ProductRegistrationScreenProps {
  route?: {
    params?: {
      barcode?: string;
    };
  };
}

export function ProductRegistrationScreen({ route }: ProductRegistrationScreenProps): React.ReactElement {
  const { categories, isLoading: isCatsLoading, error: catsError } = useCategories();
  const { state: scannerState, setScanState } = useScannerState();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductRegistrationFormData>({
    resolver: zodResolver(productRegistrationSchema) as any,
    defaultValues: {
      name: '',
      barcode: '',
      expirationDate: new Date(),
      categoryId: '',
    },
    mode: 'onChange',
  });

  const barcodeValue = watch('barcode');

  useEffect(() => {
    if (route?.params?.barcode) {
      setValue('barcode', route.params.barcode, { shouldValidate: true });
    }
  }, [route?.params?.barcode, setValue]);

  const onSubmit: SubmitHandler<ProductRegistrationFormData> = useCallback(
    async (data) => {
      try {
        setScanState('processing');
        await productApi.create(data);
        Alert.alert('Éxito', 'Producto registrado correctamente');
        setValue('name', '', { shouldValidate: true });
        setValue('barcode', '', { shouldValidate: true });
        setValue('expirationDate', new Date(), { shouldValidate: true });
        setValue('categoryId', '', { shouldValidate: true });
        setScanState('idle');
      } catch {
        setScanState('error');
        Alert.alert('Error', 'No se pudo registrar el producto.');
      }
    },
    [setScanState, setValue],
  );

  if (isCatsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (catsError) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.errorText}>{catsError}</Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Registrar Producto</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="words"
          onChangeText={(value) => setValue('name', value, { shouldValidate: true })}
          value={watch('name')}
        />
        {!!errors.name && <Text style={styles.fieldError}>{errors.name.message}</Text>}

        <Text style={styles.label}>Código de barras</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe el código o escanea"
          placeholderTextColor="#999"
          autoCorrect={false}
          autoCapitalize="characters"
          onChangeText={(value) => setValue('barcode', value, { shouldValidate: true })}
          value={barcodeValue}
        />
        {!!errors.barcode && <Text style={styles.fieldError}>{errors.barcode.message}</Text>}

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={watch('categoryId')}
            onValueChange={(value) =>
              setValue('categoryId', String(value), { shouldValidate: true })
            }
          >
            <Picker.Item label="Seleccionar categoría" value="" />
            {categories.map((c) => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>
        {!!errors.categoryId && (
          <Text style={styles.fieldError}>{errors.categoryId.message}</Text>
        )}

        <Text style={styles.label}>Fecha de vencimiento</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          onChangeText={(value) => {
            // z.coerce.date() permitirá convertir en submit
            setValue('expirationDate', value as unknown as Date, {
              shouldValidate: true,
            });
          }}
          value={(() => {
            const v = watch('expirationDate');
            if (!v) return '';
            if (v instanceof Date) return v.toISOString().slice(0, 10);
            return String(v);
          })()}
        />
        {!!errors.expirationDate && (
          <Text style={styles.fieldError}>{errors.expirationDate.message}</Text>
        )}

        <View style={styles.submitRow}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!barcodeValue || isSubmitting) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!barcodeValue || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* La cámara/UI se mantiene en ScannerScreen para no romper navegación. */}
        {scannerState === 'processing' && (
          <Text style={styles.processingHint}>Procesando...</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111',
  },
  fieldError: { marginTop: 6, color: '#d32f2f', fontSize: 12 },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  submitRow: { marginTop: 18 },
  primaryButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: '#d32f2f', textAlign: 'center' },
  processingHint: { marginTop: 12, color: '#2e7d32', textAlign: 'center' },
});

