import React, { useState } from 'react';
import { startGame } from '../services/gameService.ts';

const StartGameButton = () => {
    const [gameId, setGameId] = useState('');

    const handleClick = async () => {
        try {
            await startGame(gameId);
            alert('Game started successfully');
        } catch (error) {
            console.error('Error starting game', error);
        }
    };

    return (
        <div>
            <label>
                Game ID:
                <input type="text" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            </label>
            <button onClick={handleClick}>Start Game</button>
        </div>
    );
};

export default StartGameButton;