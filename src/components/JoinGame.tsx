import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '../services/gameService';
import { TextField, Button, Box } from '@mui/material';
import { usePlayerRole } from '../context/PlayerRoleContext';

const JoinGame: React.FC = () => {
    const [gameId, setGameId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const navigate = useNavigate();
    const { setPlayer } = usePlayerRole(); // Now TypeScript knows setPlayer exists

    const handleJoin = () => {
        if (!gameId.trim() || !playerName.trim()) {
            alert("Both Game ID and Player Name are required.");
            return;
        }
        joinGame(gameId, playerName)
            .then(() => {
                setPlayer(); // Set the role as player when joining the game
                navigate(`/lobby/${gameId}`);
            })
            .catch(error => {
                console.error('Error joining game:', error);
                alert('Error joining game. Please check console for details.');
            });
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <TextField
                label="Game ID"
                variant="outlined"
                value={gameId}
                onChange={e => setGameId(e.target.value)}
                margin="normal"
            />
            <TextField
                label="Your Name"
                variant="outlined"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleJoin}>
                Join Game
            </Button>
        </Box>
    );
};

export default JoinGame;
