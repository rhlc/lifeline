import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import type {
  AnyBoard,
  Board,
  DayInput,
  DaySaveResult,
  SettingsInputDTO,
  MonthInputDTO,
  GoalInputDTO,
  RewardInputDTO,
  TaskInputDTO,
} from '@lifeline/shared';
import { api, ApiError } from './client.js';

const KEY = ['board'] as const;

/** Try the owner board; on 401 fall back to the public read-only board. */
async function fetchBoard(): Promise<AnyBoard> {
  try {
    return await api.get<Board>('/api/board');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return api.get<AnyBoard>('/api/public/board');
    }
    throw err;
  }
}

export function useBoard(): UseQueryResult<AnyBoard> {
  return useQuery({ queryKey: KEY, queryFn: fetchBoard });
}

function useBoardSetter() {
  const qc = useQueryClient();
  return (board: Board) => qc.setQueryData(KEY, board);
}

export function useSaveDay() {
  const setBoard = useBoardSetter();
  return useMutation({
    mutationFn: (vars: { date: string; input: DayInput }) =>
      api.put<DaySaveResult>(`/api/day/${vars.date}`, vars.input),
    onSuccess: (res) => setBoard(res.board),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => api.post<{ ok: true }>('/api/login', { password }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/logout'),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSaveSettings() {
  const setBoard = useBoardSetter();
  return useMutation({
    mutationFn: (input: SettingsInputDTO) => api.put<Board>('/api/settings', input),
    onSuccess: setBoard,
  });
}

export function useSaveMonth() {
  const setBoard = useBoardSetter();
  return useMutation({
    mutationFn: (vars: { month: string; input: MonthInputDTO }) =>
      api.put<Board>(`/api/month/${vars.month}`, vars.input),
    onSuccess: setBoard,
  });
}

export function useGoalMutations() {
  const setBoard = useBoardSetter();
  const create = useMutation({
    mutationFn: (input: GoalInputDTO) => api.post<Board>('/api/goals', input),
    onSuccess: setBoard,
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; input: GoalInputDTO }) =>
      api.put<Board>(`/api/goals/${vars.id}`, vars.input),
    onSuccess: setBoard,
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.del<Board>(`/api/goals/${id}`),
    onSuccess: setBoard,
  });
  return { create, update, remove };
}

export function useRewardMutations() {
  const setBoard = useBoardSetter();
  const create = useMutation({
    mutationFn: (input: RewardInputDTO) => api.post<Board>('/api/rewards', input),
    onSuccess: setBoard,
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; input: RewardInputDTO }) =>
      api.put<Board>(`/api/rewards/${vars.id}`, vars.input),
    onSuccess: setBoard,
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.del<Board>(`/api/rewards/${id}`),
    onSuccess: setBoard,
  });
  return { create, update, remove };
}

export function useTaskMutations() {
  const setBoard = useBoardSetter();
  const create = useMutation({
    mutationFn: (input: TaskInputDTO) => api.post<Board>('/api/tasks', input),
    onSuccess: setBoard,
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; input: TaskInputDTO }) =>
      api.put<Board>(`/api/tasks/${vars.id}`, vars.input),
    onSuccess: setBoard,
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.del<Board>(`/api/tasks/${id}`),
    onSuccess: setBoard,
  });
  return { create, update, remove };
}
