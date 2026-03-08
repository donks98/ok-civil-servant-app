import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, errorMessage: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning-outline" size={40} color="#CC0000" />
        </View>
        <Text style={styles.title}>{this.props.fallbackTitle ?? 'Something went wrong'}</Text>
        <Text style={styles.message}>
          {this.state.errorMessage || 'An unexpected error occurred in this screen.'}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F4F4F4',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: '#FFCCCC',
  },
  title: {
    fontSize: 20, fontWeight: '800', color: '#1A1A1A',
    marginBottom: 8, textAlign: 'center',
  },
  message: {
    fontSize: 14, color: '#6B6B6B', textAlign: 'center',
    lineHeight: 20, marginBottom: 28,
  },
  btn: {
    backgroundColor: '#CC0000', paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 12,
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
