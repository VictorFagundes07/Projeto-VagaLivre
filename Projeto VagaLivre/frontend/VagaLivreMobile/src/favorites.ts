import { createAsyncStorage } from '@react-native-async-storage/async-storage';

const storage = createAsyncStorage('VagaLivreFavorites');

export async function loadFavorites(userId: string): Promise<string[]> {
  const saved = await storage.getItem(userId);
  if (!saved) {
    return [];
  }
  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || parsed.some(id => typeof id !== 'string')) {
    throw new Error('Não foi possível carregar suas garagens favoritas.');
  }
  return [...new Set(parsed as string[])];
}

export async function saveFavorites(userId: string, ids: string[]) {
  await storage.setItem(userId, JSON.stringify(ids));
}
