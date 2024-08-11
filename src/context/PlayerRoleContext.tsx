import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerRoleContextType {
    isHost: boolean;
    setHost: () => void;
    setPlayer: () => void;
}

const PlayerRoleContext = createContext<PlayerRoleContextType | undefined>(undefined);

export const PlayerRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHost, setIsHost] = useState(false);

    const setHost = () => setIsHost(true);
    const setPlayer = () => setIsHost(false);

    return (
        <PlayerRoleContext.Provider value={{ isHost, setHost, setPlayer }}>
            {children}
        </PlayerRoleContext.Provider>
    );
};

export const usePlayerRole = (): PlayerRoleContextType => {
    const context = useContext(PlayerRoleContext);
    if (!context) {
        throw new Error('usePlayerRole must be used within a PlayerRoleProvider');
    }
    return context;
};
