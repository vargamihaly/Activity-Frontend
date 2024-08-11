import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails, startGame } from '../services/gameService';
import { handleApiError } from '../utils/errorHandler';
import UpdateSettingsForm from './UpdateSettingsForm';
import { usePlayerRole } from '../context/PlayerRoleContext';
import {
    Typography, List, ListItem, CircularProgress, Box, Button, Divider
} from '@mui/material';
import { GameDetails, Player } from '../types/GameTypes';

const Lobby: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>(); // Ensuring gameId is a string
    const navigate = useNavigate();
    const { isHost } = usePlayerRole();
    const [players, setPlayers] = useState<Player[]>([]);
    const [settings, setSettings] = useState({
        methods: '',
        timer: 0,
        maxScore: 5,
    });
    const [loading, setLoading] = useState(true);
    const [startingGame, setStartingGame] = useState(false);
    const [hostName, setHostName] = useState('');

    // Ensure the component has a valid gameId; this mimics a "constructor check"
    if (!gameId) {
        throw new Error("Lobby must be provided with a valid gameId."); // Similar to constructor validation
    }

    useEffect(() => {
        getGameDetails(gameId)
            .then((data: GameDetails) => {
                setPlayers(data.players);
                setSettings({
                    methods: data.methods.join(', '),
                    timer: data.timer,
                    maxScore: data.maxScore,
                });
                setHostName(data.host.name);
            })
            .catch(error => handleApiError(error))
            .finally(() => setLoading(false));
    }, [gameId]);

    const handleStartGame = () => {
        setStartingGame(true);
        startGame(gameId)
            .then(() => navigate(`/game/${gameId}`))
            .catch(error => handleApiError(error))
            .finally(() => setStartingGame(false));
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Lobby for Game ID: {gameId}
            </Typography>

            <Typography variant="subtitle1">
                Current Host: {hostName}
            </Typography>
            <Typography variant="subtitle1" color={isHost ? "primary" : "textSecondary"}>
                You are {isHost ? "the Host" : "a Player"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {isHost && (
                <>
                    <UpdateSettingsForm
                        gameId={gameId}
                        initialMethods={settings.methods}
                        initialTimer={settings.timer}
                        initialMaxScore={settings.maxScore}
                        onSuccess={() => console.log('Settings updated')}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStartGame}
                        disabled={startingGame}
                        sx={{ mt: 2 }}
                    >
                        {startingGame ? <CircularProgress size={24} /> : 'Start Game'}
                    </Button>
                </>
            )}

            <List>
                {players.map(player => (
                    <ListItem key={player.id}>{player.name}</ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Lobby;
