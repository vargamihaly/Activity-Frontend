import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameDetails } from '@/interfaces/GameTypes';
import { useGameDetails } from '@/hooks/gameHooks';

interface GameContextType {
    currentGame: GameDetails | null;
    setCurrentGame: (game: GameDetails | null) => void;
    isInGame: boolean;
    setIsInGame: (inGame: boolean) => void;
    refreshGameDetails: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentGame, setCurrentGame] = useState<GameDetails | null>(null);
    const [isInGame, setIsInGame] = useState<boolean>(false);

    const { data: gameDetails, refetch } = useGameDetails(isInGame ? localStorage.getItem('currentGameId') || undefined : undefined);

    const clearCurrentGameId = () => {
        localStorage.removeItem('currentGameId');
    };

    useEffect(() => {
        clearCurrentGameId(); // Clear currentGameId when the application starts
    }, []);

    useEffect(() => {
        const storedGameId = localStorage.getItem('currentGameId');
        if (storedGameId) {
            setIsInGame(true);
        }
    }, []);

    useEffect(() => {
        if (gameDetails) {
            setCurrentGame(gameDetails);
        }
    }, [gameDetails]);

    const refreshGameDetails = () => {
        if (isInGame) {
            refetch();
        }
    };

    return (
        <GameContext.Provider value={{ currentGame, setCurrentGame, isInGame, setIsInGame, refreshGameDetails }}>
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