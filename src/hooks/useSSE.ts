import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';

const useSSE = (
    gameId: string | undefined,
    onGameStarted?: () => void,
    onGameEnded?: (winnerId: string) => void
) => {
    const [isConnected, setIsConnected] = useState(false);
    const { refreshGameDetails } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (!gameId) return;

        const eventSource = new EventSource(`/api/GameEvents/${gameId}`);

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('SSE Connected');
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            setIsConnected(false);
        };

        eventSource.addEventListener('UserJoinedLobby', () => {
            console.log('User joined lobby');
            refreshGameDetails();
        });

        eventSource.addEventListener('GameStarted', (event) => {
            console.log('Game started:', event.data);
            refreshGameDetails();
            if (onGameStarted) {
                onGameStarted();
            } else {
                navigate(`/game/${gameId}`);
            }
        });

        eventSource.addEventListener('RoundEnded', () => {
            console.log('Round ended');
            refreshGameDetails();
        });

        eventSource.addEventListener('GameEnded', (event) => {
            console.log('Game ended:', event.data);
            refreshGameDetails();
            if (onGameEnded) onGameEnded(event.data);
        });

        return () => {
            eventSource.close();
        };
    }, [gameId, onGameStarted, onGameEnded, refreshGameDetails, navigate]);

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