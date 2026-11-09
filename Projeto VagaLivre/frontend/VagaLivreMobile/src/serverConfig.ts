import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { api } from './api';

const settings = createAsyncStorage('VagaLivreSettings');
const serverKey = 'apiUrl';
export const isServerUrl = (value: string) =>
  /^https?:\/\/[^\s]+\/api\/?$/.test(value.trim());

export async function restoreServer() {
  const saved = await settings.getItem(serverKey);
  if (saved && isServerUrl(saved)) {
    api.defaults.baseURL = saved;
  }
}

export async function saveServer(value: string) {
  const url = value.trim().replace(/\/$/, '');
  if (!isServerUrl(url)) {
    throw new Error('Informe uma URL HTTP ou HTTPS terminando em /api.');
  }
  await settings.setItem(serverKey, url);
  api.defaults.baseURL = url;
}
