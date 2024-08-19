import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCreateGame, useGameDetails, useJoinGame } from "@/hooks/gameHooks";
import { useToast } from "@/hooks/use-toast";
import GameActionCard from "@/pages/Main/GameActionCard";
import UserLoading from "@/pages/Main/UserLoading";
import JoinGameDialog from "@/pages/Main/JoinGameDialog";
import { useGame } from "@/context/GameContext";
import { GameDetails, GameStatus } from "@/interfaces/GameTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Main: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [joinGameId, setJoinGameId] = useState('');
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const { currentGame, setCurrentGame, isInGame, setIsInGame } = useGame();
    const { toast } = useToast();

    const createGameMutation = useCreateGame();
    const joinGameMutation = useJoinGame();
    const storedGameId = localStorage.getItem('currentGameId');
    const { data: fetchedGameDetails, isLoading: isLoadingGameDetails, error: gameDetailsError } = useGameDetails(storedGameId || undefined);

    useEffect(() => {
        if (storedGameId && !currentGame) {
            if (fetchedGameDetails) {
                setCurrentGame(fetchedGameDetails);
                setIsInGame(true);
            } else if (gameDetailsError) {
                toast({
                    title: "Error",
                    description: "Failed to fetch game details. Please try again.",
                    variant: "destructive",
                });
                localStorage.removeItem('currentGameId');
            }
        }
    }, [storedGameId, currentGame, fetchedGameDetails, gameDetailsError, setCurrentGame, setIsInGame, toast]);

    const handleCreateGame = () => {
        if (isInGame) {
            const confirmNewGame = window.confirm("You are already in a game. Creating a new game will remove you from the current one. Are you sure you want to continue?");
            if (!confirmNewGame) return;
        }

        createGameMutation.mutate(undefined, {
            onSuccess: (response) => {
                const gameId = response.data?.gameId;
                if (gameId) {
                    setCurrentGame({ id: gameId, gameStatus: GameStatus.Waiting } as GameDetails);
                    setIsInGame(true);
                    localStorage.setItem('currentGameId', gameId);
                    navigate(`/lobby/${gameId}`);
                } else {
                    toast({
                        title: "Error",
                        description: "Game created but no ID returned. Please try again.",
                        variant: "destructive",
                    });
                }
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: `Failed to create game: ${error.message}`,
                    variant: "destructive",
                });
            }
        });
    };

    const handleJoinGame = () => {
        if (isInGame) {
            const confirmJoinNewGame = window.confirm("You are already in a game. Joining a new game will remove you from the current one. Are you sure you want to continue?");
            if (!confirmJoinNewGame) return;
        }

        const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        let isValidGuid = guidRegex.test(joinGameId);

        if (!isValidGuid) {
            toast({
                title: "Error",
                description: "Please enter a valid game ID",
                variant: "destructive",
            });
            return;
        }

        joinGameMutation.mutate(joinGameId, {
            onSuccess: () => {
                setCurrentGame({ id: joinGameId, gameStatus: GameStatus.Waiting } as GameDetails);
                setIsInGame(true);
                localStorage.setItem('currentGameId', joinGameId);
                navigate(`/lobby/${joinGameId}`);
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to join game. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleReturnToGame = () => {
        if (currentGame) {
            if (currentGame.gameStatus === GameStatus.InProgress) {
                navigate(`/game/${currentGame.id}`);
            } else {
                navigate(`/lobby/${currentGame.id}`);
            }
        }
    };

    if (!user) {
        return <UserLoading />;
    }

    if (isLoadingGameDetails) {
        return <div>Loading game details...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Welcome, {user.username}!</h1>

                {isInGame && currentGame && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Ongoing Game</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You are currently in a game (ID: {currentGame.id})</p>
                            <p>Game Status: {GameStatus[currentGame.gameStatus]}</p>
                            <Button onClick={handleReturnToGame} className="mt-4">
                                Return to Game
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GameActionCard
                        title="Create New Game"
                        description="Start a new game and invite your friends to join."
                        actionText="Create Game"
                        onAction={handleCreateGame}
                        isLoading={createGameMutation.isPending}
                        variant="create"
                    />
                    <GameActionCard
                        title="Join Existing Game"
                        description="Enter a game ID to join an existing game."
                        actionText="Join Game"
                        onAction={() => setIsJoinDialogOpen(true)}
                        isLoading={false}
                        variant="join"
                    />
                </div>
            </div>

            <JoinGameDialog
                open={isJoinDialogOpen}
                joinGameId={joinGameId}
                onOpenChange={setIsJoinDialogOpen}
                onJoinGameIdChange={setJoinGameId}
                onJoinGame={handleJoinGame}
                isJoining={joinGameMutation.isPending}
            />
        </div>
    );
};

export default Main;