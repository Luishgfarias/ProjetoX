import AsyncStorage from '@react-native-async-storage/async-storage';
import { LaunchList } from '../@types/launch';

const CACHE_KEY_PREFIX = '@lancamentos_cache_';

/**
 * Gera a chave de cache para uma página específica
 * @param page - Número da página
 * @returns Chave de cache formatada
 */
function getCacheKey(page: number): string {
  return `${CACHE_KEY_PREFIX}${page}`;
}

/**
 * Salva uma página de lançamentos no storage local
 * @param page - Número da página
 * @param data - Dados da lista de lançamentos
 * @returns Promise que resolve quando o armazenamento é concluído
 */
export async function saveLancamentosPage(
  page: number,
  data: LaunchList
): Promise<void> {
  try {
    const key = getCacheKey(page);
    const serializedData = JSON.stringify(data);
    await AsyncStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Erro ao salvar página ${page} no storage:`, error);
    throw new Error(`Falha ao salvar página ${page} no cache local`);
  }
}

/**
 * Recupera uma página de lançamentos do storage local
 * @param page - Número da página
 * @returns Promise com os dados da página ou null se não encontrado
 */
export async function getLancamentosPage(
  page: number
): Promise<LaunchList | null> {
  try {
    const key = getCacheKey(page);
    const cachedData = await AsyncStorage.getItem(key);

    if (cachedData === null) {
      return null;
    }

    const parsedData = JSON.parse(cachedData) as LaunchList;
    return parsedData;
  } catch (error) {
    console.error(`Erro ao recuperar página ${page} do storage:`, error);
    // Retorna null em caso de erro ao invés de lançar exceção
    // para não quebrar o fluxo da aplicação
    return null;
  }
}

/**
 * Limpa todo o cache de lançamentos armazenado
 * @returns Promise que resolve quando a limpeza é concluída
 */
export async function clearLancamentosCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(CACHE_KEY_PREFIX)
    );

    if (cacheKeys.length > 0) {
      await Promise.all(
        cacheKeys.map((key) => AsyncStorage.removeItem(key))
      );
    }
  } catch (error) {
    console.error('Erro ao limpar cache de lançamentos:', error);
    throw new Error('Falha ao limpar cache de lançamentos');
  }
}
