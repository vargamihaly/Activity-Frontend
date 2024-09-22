import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGameDetails } from '@/hooks/gameHooks';
import {components} from "@/api/activitygame-schema";
type GetGameDetailsResponse = components['schemas']['GetGameDetailsResponse'];


interface GameContextType {
    currentGame: GetGameDetailsResponse | null;
    setCurrentGame: (game: GetGameDetailsResponse | null) => void;
    isInGame: boolean;
    setIsInGame: (inGame: boolean) => void;
    refreshGameDetails: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentGame, setCurrentGame] = useState<GetGameDetailsResponse | null>(null);
    const [isInGame, setIsInGame] = useState<boolean>(false);

    const { data: gameDetails, refetch } = useGameDetails(isInGame ? localStorage.getItem('currentGameId') || undefined : undefined);

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