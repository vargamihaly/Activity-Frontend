import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EndTurnRequest, UpdateGameSettingsRequest} from '@/interfaces/RequestTypes';
import {
    StartGameResponse,
    GameDetailsResponse,
    EndTurnResponse,
    CreateGameResponse, ApiResponse,
} from '@/interfaces/ResponseTypes';
import {mapGameDetailsResponseToGameDetails} from "@/utils/mappers";
import {GameDetails} from "@/interfaces/GameTypes";

const API_URL = '/api/games';


const apiFetch = async <T,>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || response.statusText);
    }

    return data;
};


export const useCreateGame = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<CreateGameResponse>, Error, void>({
        mutationFn: async () => {
            return await apiFetch<CreateGameResponse>(`${API_URL}/create`, { method: 'POST' });
        },
        onSuccess: async (data) => {
            const gameId = data.data?.gameId;
            if (gameId) {
                await queryClient.invalidateQueries({
                    queryKey: ['games', gameId]
                });
            }
        }
    });
};


// Join Game Mutation
export const useJoinGame = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: async (gameId: string) => {
            return await apiFetch<void>(`${API_URL}/${gameId}/join`, { method: 'POST' });
        },
        onSuccess: async (data, gameId) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        }
    });
};

// Update Game Settings Mutation

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error, { gameId: string; request: UpdateGameSettingsRequest }>({
        mutationFn: async ({ gameId, request }) => {
            return await apiFetch<void>(`${API_URL}/${gameId}/settings`, {
                method: 'PUT',
                body: JSON.stringify(request)
            });
        },
        onSuccess: async (data, gameId) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        }
    });
};

// Start Game Mutation
export const useStartGame = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<StartGameResponse>, Error, string>({
        mutationFn: async (gameId: string) => {
            return await apiFetch<StartGameResponse>(`${API_URL}/${gameId}/start`, { method: 'POST' });
        },
        onSuccess: async (data, gameId) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        }
    });
};

export const useGameDetails = (gameId: string | undefined) => {
    return useQuery<GameDetails, Error>({
        queryKey: ['games', gameId],
        queryFn: async (): Promise<GameDetails> => {
            if (!gameId) {
                throw new Error('Game ID is required');
            }
            const response = await apiFetch<GameDetailsResponse>(`${API_URL}/${gameId}`, { method: 'GET' });
            return mapGameDetailsResponseToGameDetails(response.data as GameDetailsResponse);
        },
        refetchInterval: 5000,
        refetchOnWindowFocus: false,
        enabled: !!gameId, // Only run the query if gameId is truthy
    });
};

// End Turn Mutation
export const useEndTurn = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<EndTurnResponse>, Error, { gameId: string; request: EndTurnRequest }>({
        mutationFn: async ({ gameId, request }) => {
            return await apiFetch<EndTurnResponse>(`${API_URL}/${gameId}/end-turn`, {
                method: 'POST',
                body: JSON.stringify(request)
            });
        },
        onSuccess: async (data, { gameId }) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        }
    });
};