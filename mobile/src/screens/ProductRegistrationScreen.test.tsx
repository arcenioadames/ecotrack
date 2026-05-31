
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { ProductRegistrationScreen } from './ProductRegistrationScreen';

jest.mock('react-native', () => {
  const React = require('react');

  const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
  const View = ({ children, accessibilityLabel: _accessibilityLabel, testID: _testID, ...props }: any) =>
    React.createElement('div', props, children);
  const ScrollView = ({
    children,
    accessibilityLabel: _accessibilityLabel,
    testID: _testID,
    contentContainerStyle: _contentContainerStyle,
    ...props
  }: any) => React.createElement('div', props, children);
  const KeyboardAvoidingView = ({
    children,
    accessibilityLabel: _accessibilityLabel,
    testID: _testID,
    contentContainerStyle: _contentContainerStyle,
    ...props
  }: any) => React.createElement('div', props, children);

  const TextInput = ({
    value,
    onChangeText,
    placeholder,
    onBlur,
    placeholderTextColor: _placeholderTextColor,
    autoCorrect: _autoCorrect,
    secureTextEntry: _secureTextEntry,
    keyboardType: _keyboardType,
    accessibilityLabel: _accessibilityLabel,
    testID: _testID,
    ...props
  }: any) =>
    React.createElement('input', {
      ...props,
      value,
      placeholder,
      onBlur,
      onChange: (event: any) => onChangeText?.(event.target.value),
    });
  const TouchableOpacity = ({ children, onPress, accessibilityLabel: _accessibilityLabel, testID: _testID, ...props }: any) =>
    React.createElement('button', {
      ...props,
      onClick: onPress,
    }, children);

  const ActivityIndicator = () => React.createElement('span', null, 'Loading');

  const StyleSheet = {
    create: (styles: any) => styles,
    flatten: (style: any) => (Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  return {
    ActivityIndicator,
    Alert: { alert: jest.fn() },
    KeyboardAvoidingView,
    Platform: { OS: 'ios' },
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  };
});

jest.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [{ id: 'cat-1', name: 'Lacteos', description: null }],
    isLoading: false,
    error: null,
    refetch: async () => {},
  }),
}));

jest.mock('../hooks/useScannerState', () => ({
  useScannerState: () => ({
    state: 'idle',
    errorMessage: null,
    setScanState: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../hooks/useBarcodeScanner', () => ({
  useBarcodeScanner: () => ({
    lastBarcode: null,
    isProcessing: false,
    error: null,
    handleBarcodeDetected: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../services/productApi', () => ({
  productApi: {
    create: jest.fn(async () => ({
      product: {
        id: 'prod-1',
        name: 'Leche',
        barcode: '4006381333931',
        expirationDate: '2026-06-01T00:00:00.000Z',
        category: { id: 'cat-1', name: 'Lacteos', description: null },
        createdBy: 'user-1',
      },
    })),
  },
}));

// react-native-picker relies on native props; keep it simple for tests.
jest.mock('@react-native-picker/picker', () => {
  const { View } = require('react-native');

  const Picker = ({ children }: { children: unknown }) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: { label: string }) => <View accessibilityLabel={label} />;

  return {
    Picker,
  };
});

describe('ProductRegistrationScreen', () => {
  it('shows validation errors for empty submit', async () => {
    const { getByText, getByPlaceholderText } = render(<ProductRegistrationScreen />);

    const barcodeInput = getByPlaceholderText('Escribe el código o escanea');
    await act(async () => {
      fireEvent.change(barcodeInput, { target: { value: '4006381333931' } });
    });

    const saveBtn = getByText('Guardar');

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(getByText('El nombre debe tener al menos 3 caracteres')).toBeTruthy();
      expect(getByText('La categoría es obligatoria')).toBeTruthy();
      // expirationDate has a coerce.date validation message when invalid
    });
  });

  it('blocks submit when categoryId is missing', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <ProductRegistrationScreen />,
    );

    const nameInput = getByPlaceholderText('Nombre del producto');
    const barcodeInput = getByPlaceholderText('Escribe el c\u00f3digo o escanea');
    const expirationInput = getByPlaceholderText('YYYY-MM-DD');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Leche' } });
      fireEvent.change(barcodeInput, { target: { value: '4006381333931' } });
      fireEvent.change(expirationInput, { target: { value: '2026-06-01' } });
    });

    const saveBtn = getByText('Guardar');
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(queryByText('La categor\u00eda es obligatoria')).toBeTruthy();
    });

    const { productApi } = require('../services/productApi');
    expect(productApi.create).not.toHaveBeenCalled();
  });
});

