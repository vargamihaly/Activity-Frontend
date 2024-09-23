import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectToGameEventStream } from "@/api/games-api";
import { useToast } from "@/hooks/use-toast";

interface UseSSEOptions {
    onGameStarted?: () => void;
    onGameEnded?: (winnerId: string) => void;
    onRoundEnded?: () => void;
    onPlayerLeftLobby?: (leftPlayerId: string) => void;
    // onGameCancelled: () => void;
}

const useSSE = (gameId: string | undefined, options: UseSSEOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const maxRetryCount = 5;
    const baseDelay = 1000; // 1 second

    const { onGameStarted, onGameEnded, onRoundEnded, onPlayerLeftLobby } = options;

    const setupSSE = useCallback(async () => {
        if (!gameId) return;

        try {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const eventSource = await connectToGameEventStream(gameId);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                setError(null);
                setRetryCount(0);
                console.log('SSE Connected');
            };

            eventSource.onerror = (event) => {
                console.error('SSE Error:', event);
                setIsConnected(false);
                setError(new Error('Failed to connect to game events'));
                eventSource.close();

                if (retryCount < maxRetryCount) {
                    const delay = Math.min(baseDelay * 2 ** retryCount, 30000); // Max delay of 30 seconds
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        setupSSE(); // Retry connection
                    }, delay);
                } else {
                    toast({
                        title: "Connection Error",
                        description: "Failed to connect to game events after multiple attempts. Please refresh the page.",
                        variant: "destructive"
                    });
                }
            };

            const addEventHandler = (eventName: string, handler: (event: Event) => void) => {
                eventSource.addEventListener(eventName, handler);
            };

            addEventHandler('UserJoinedLobby', () => {
                console.log('User joined lobby');
            });
            
            addEventHandler('GameStarted', (event: Event) => {
                console.log('Game started:', (event as MessageEvent).data);
                if (onGameStarted) {
                    onGameStarted();
                } else {
                    navigate(`/game/${gameId}`);
                }
            });

            addEventHandler('RoundEnded', () => {
                console.log('Round ended');
                if (onRoundEnded) {
                    onRoundEnded();
                }
            });

            addEventHandler('GameEnded', (event: Event) => {
                console.log('Game ended:', (event as MessageEvent).data);
                if (onGameEnded) {
                    onGameEnded((event as MessageEvent).data);
                } else {
                    navigate(`/game-stats/${gameId}`);
                }
            });

            addEventHandler('PlayerLeftLobby', (event: Event) => {
                const messageEvent = event as MessageEvent;
                console.log('Player left the lobby:', messageEvent.data);
                if (onPlayerLeftLobby) {
                    const leftPlayerId = messageEvent.data;
                    onPlayerLeftLobby(leftPlayerId);
                }
            });

        } catch (error) {
            console.error('Error setting up SSE:', error);
            setError(error instanceof Error ? error : new Error('An unknown error occurred'));
            setIsConnected(false);

            if (retryCount < maxRetryCount) {
                const delay = Math.min(baseDelay * 2 ** retryCount, 30000);
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    setupSSE(); // Retry connection
                }, delay);
            } else {
                toast({
                    title: "Setup Error",
                    description: "Failed to set up game events after multiple attempts. Please try again later.",
                    variant: "destructive"
                });
            }
        }
    }, [gameId, retryCount, navigate, toast, onGameStarted, onGameEnded, onRoundEnded]);

    useEffect(() => {
        setupSSE();

        return () => {
            console.log('Cleaning up SSE connection');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [setupSSE]);

    return { isConnected, error };
};

export default useSSE;