import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { connectToGameEventStream } from "@/api/games-api";
import { useToast } from "@/hooks/use-toast";

const useSSE = (
    gameId: string | undefined,
    onGameStarted?: () => void,
    onGameEnded?: (winnerId: string) => void,
    onRoundEnded?: () => void
) => {
    const [isConnected, setIsConnected] = useState(false);
    const { refreshGameDetails } = useGame();
    const navigate = useNavigate();
    const eventSourceRef = useRef<EventSource | null>(null);
    const { toast } = useToast();

    const setupSSE = useCallback(async () => {
        if (!gameId) return;

        try {
            const eventSource = await connectToGameEventStream(gameId);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                console.log('SSE Connected');
            };

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                setIsConnected(false);
                toast({
                    title: "Connection Error",
                    description: "Failed to connect to game events. Please try refreshing the page.",
                    variant: "destructive"
                });
            };

            const addEventHandler = (eventName: string, handler: (event: Event) => void) => {
                eventSource.addEventListener(eventName, handler);
            };

            addEventHandler('UserJoinedLobby', () => {
                console.log('User joined lobby');
                refreshGameDetails();
            });

            addEventHandler('GameStarted', (event: Event) => {
                console.log('Game started:', (event as MessageEvent).data);
                refreshGameDetails();
                if (onGameStarted) {
                    onGameStarted();
                } else {
                    navigate(`/game/${gameId}`);
                }
            });

            addEventHandler('RoundEnded', () => {
                console.log('Round ended');
                refreshGameDetails();
                if (onRoundEnded) {
                    onRoundEnded();
                }
            });

            addEventHandler('GameEnded', (event: Event) => {
                console.log('Game ended:', (event as MessageEvent).data);
                refreshGameDetails();
                if (onGameEnded) {
                    onGameEnded((event as MessageEvent).data);
                } else {
                    navigate(`/game-stats/${gameId}`);
                }
            });

        } catch (error) {
            console.error('Error setting up SSE:', error);
            setIsConnected(false);
            toast({
                title: "Setup Error",
                description: "Failed to set up game events. Please try again later.",
                variant: "destructive"
            });
        }
    }, [gameId, onGameStarted, onGameEnded, onRoundEnded, refreshGameDetails, navigate, toast]);

    useEffect(() => {
        setupSSE();

        return () => {
            console.log('Cleaning up SSE connection');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [setupSSE]);

    const joinGame = useCallback(() => {
        console.log('Joined game');
        // This is now handled automatically when connecting to the SSE endpoint
    }, []);

    const leaveGame = useCallback(() => {
        console.log('Left game');
        // This is now handled automatically when the component unmounts
    }, []);

    return { joinGame, leaveGame, isConnected };
};

export default useSSE;