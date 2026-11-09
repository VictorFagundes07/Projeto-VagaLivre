import axios from 'axios';
import { Platform } from 'react-native';

// Em aparelho físico, substitua pelo IP do computador na mesma rede Wi-Fi.
export const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5108/api'
    : 'http://localhost:5108/api';

export const api = axios.create({ baseURL: DEFAULT_API_URL, timeout: 15000 });

export function setToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Não foi possível conectar à API. Confira se o backend está ligado e o endereço em Conexão.';
    }
    const data = error.response.data;
    if (data?.message) {
      return data.message;
    }
    if (data?.errors) {
      return Object.values(data.errors).flat().join('\n');
    }
    if (error.response.status === 401) {
      return 'E-mail ou senha inválidos, ou sessão expirada. Entre novamente.';
    }
    if (error.response.status === 404) {
      return 'Este registro não está mais disponível.';
    }
    return 'Não foi possível concluir a operação. Tente novamente.';
  }
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  rating: number;
  isActive: boolean;
};
export type Garage = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  maxVehicleType: number;
  isActive: boolean;
};
export const vehicles = [
  'Moto',
  'Carro hatch',
  'Carro sedan',
  'SUV',
  'Caminhonete',
];
