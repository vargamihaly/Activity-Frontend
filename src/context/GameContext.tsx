import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGameDetails } from '@/hooks/gameHooks';
import {components} from "@/api/activitygame-schema";
import {useAuth} from "@/context/AuthContext";
type GetGameDetailsResponse = components['schemas']['GetGameDetailsResponse'];


interface GameContextType {
    readonly currentGame: GetGameDetailsResponse | null;
    readonly isInGame: boolean;
    readonly isHost: boolean;
    refreshGameDetails: () => void;
}
//TODO decide where to handle host status, here or USerCOntext

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameId, setGameId] = useState<string | undefined>(localStorage.getItem('currentGameId') || undefined);
    const { user } = useAuth();
    const { data: gameDetails, refetch } = useGameDetails(gameId);

    useEffect(() => {
        const storedGameId = localStorage.getItem('currentGameId');
        if (storedGameId) {
            setGameId(storedGameId);
        }
    }, []);

    const isInGame = !!gameDetails && !!user && gameDetails.players!.some(player => player.id === user.id);
    const isHost = !!gameDetails && !!user && gameDetails.host.id === user.id;

    const refreshGameDetails = () => {
        if (gameId) {
            refetch();
        }
    };

    useEffect(() => {
        if (!isInGame && gameId) {
            localStorage.removeItem('currentGameId');
            setGameId(undefined);
        }
    }, [isInGame, gameId]);

    const contextValue: GameContextType = {
        currentGame: gameDetails ?? null,
        isInGame,
        refreshGameDetails,
        isHost
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};