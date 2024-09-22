import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { components } from "@/api/activitygame-schema";

import { AxiosError } from "axios";
import {getGameDetails, postCreateGame, postEndTurn, postStartGame, putGameSettings, postJoinGame} from "@/api/games-api";

const errorMessageTitle = "An error occurred";

type CreateGameResponseApiResponse = components["schemas"]["CreateGameResponseApiResponse"];
type UpdateGameSettingsRequest = components["schemas"]["UpdateGameSettingsRequest"];
type ApiResponse = components["schemas"]["ApiResponse"];
type StartGameResponseApiResponse = components["schemas"]["StartGameResponseApiResponse"];
type GetGameDetailsResponse = components["schemas"]["GetGameDetailsResponse"];
type EndTurnResponseApiResponse = components["schemas"]["EndTurnResponseApiResponse"];
type EndTurnRequest = components["schemas"]["EndTurnRequest"];


export const useCreateGame = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<CreateGameResponseApiResponse, AxiosError<ApiResponse>, void>({
        mutationFn: postCreateGame,
        onSuccess: async (response) => {
            if (response.success){
                const gameId = response.data?.gameId;
                if (gameId) {
                    await queryClient.invalidateQueries({
                        queryKey: ['games', gameId]
                    });
                }
                console.log('Game created successfully', response.data);
            }
        },
        onError: (error) => {
            console.error('Error creating game:', error);
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
            toast({
                title: "An Error Occurred",
                description: errorMessage,
                variant: "destructive"
            });
        }
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<ApiResponse, AxiosError<ApiResponse>, { gameId: string; request: UpdateGameSettingsRequest }>({
        mutationFn: async ({ gameId, request }) => putGameSettings(gameId, request),
        onSuccess: async (_, { gameId }) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    });
};

export const useJoinGame = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<ApiResponse, AxiosError<ApiResponse>, string>({
        mutationFn: postJoinGame,
        onSuccess: async (response, gameId) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
            console.log('Joined game successfully', response);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred while joining the game.";
            toast({
                title: "Error Joining Game",
                description: errorMessage,
                variant: "destructive"
            });
        }
    });
};

export const useStartGame = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<StartGameResponseApiResponse, AxiosError<ApiResponse>, string>({
        mutationFn: postStartGame,
        onSuccess: async (_, gameId) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId]
            });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast({ title: errorMessageTitle, description: errorMessage });
            throw error;
        }
    });
};

export const useGameDetails = (gameId?: string, options = {}) => {
    const { toast } = useToast();

    return useQuery<GetGameDetailsResponse, AxiosError<ApiResponse>>({
        queryKey: ['games', gameId],
        queryFn: async (): Promise<GetGameDetailsResponse> => {
            if (!gameId) {
                throw new Error('Game ID is required');
            }

            const response = await getGameDetails(gameId);

            if (!response.data) {
                const errorMessage = response.message || "Game details not found";
                toast({ title: errorMessageTitle, description: errorMessage });
                throw new Error(errorMessage);
            }

            return response.data;
        },
        ...options,
    });
};

export const useEndTurn = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<EndTurnResponseApiResponse, AxiosError<ApiResponse>, { gameId: string; request: EndTurnRequest }>({
        mutationFn: async ({ gameId, request }) => postEndTurn(gameId, request),
        onSuccess: async (_, { gameId }) => {
            await queryClient.invalidateQueries({
                queryKey: ['games', gameId],
            });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
            toast({ title: errorMessageTitle, description: errorMessage });
            throw error;
        },
    });
};