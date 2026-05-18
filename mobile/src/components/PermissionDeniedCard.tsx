import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export interface PermissionDeniedCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
}

/**
 * Componente reutilizable para mostrar estado de permisos denegados
 * Mantiene coherencia visual en toda la app
 */
export function PermissionDeniedCard({
  title,
  description,
  actionLabel = 'Habilitar',
  onAction,
  onCancel,
}: PermissionDeniedCardProps): React.ReactElement {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.actions}>
        {onAction && (
          <TouchableOpacity style={styles.primaryButton} onPress={onAction}>
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}

        {onCancel && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
