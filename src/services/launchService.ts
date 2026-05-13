import api from './api';
import { Launch, LaunchList } from '../@types/launch';

export async function getLaunches(): Promise<Launch[]> {
  const response = await api.get<Launch[]>('launches');
  return response.data;
}

export async function getLaunchById(launchId: string): Promise<Launch> {
  const response = await api.get<Launch>(`launches/${launchId}`);
  return response.data;
}

/**
 * Busca lançamentos da SpaceX de forma paginada
 * @param page - Número da página (começa em 1)
 * @returns Promise com lista paginada de lançamentos
 * @throws Erro se a requisição falhar
 */
export async function getLancamentos(page: number): Promise<LaunchList> {
  const response = await api.post<LaunchList>('launches/query', {
    query: {},
    options: {
      page,
      limit: 10,
      sort: {
        date_utc: 'desc',
      },
    },
  });
  return response.data;
}
