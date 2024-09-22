import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {useCreateGame, useGameDetails, useJoinGame} from "@/hooks/gameHooks";
import {useToast} from "@/hooks/use-toast";
import GameActionCard from "@/components/Main/GameActionCard";
import UserLoading from "@/components/Main/UserLoading";
import JoinGameDialog from "@/components/Main/JoinGameDialog";
import {useGame} from "@/context/GameContext";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {components} from "@/api/activitygame-schema";
import {GAME_STATUS} from "@/interfaces/GameTypes";

const Main: React.FC = () => {
    type GameStatus = components["schemas"]["GameStatus"];

    const navigate = useNavigate();
    const {user} = useAuth();
    const [joinGameId, setJoinGameId] = useState('');
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const {currentGame, setCurrentGame, isInGame, setIsInGame} = useGame();
    const {toast} = useToast();

    const createGameMutation = useCreateGame();
    const joinGameMutation = useJoinGame();
    const storedGameId = localStorage.getItem('currentGameId') || undefined;
    const {
        data: fetchedGameDetails,
        isLoading: isLoadingGameDetails,
        error: gameDetailsError,
        refetch: refetchGameDetails
    } = useGameDetails(storedGameId, {
        enabled: !!storedGameId,
    });

    console.log('Rendering Main component');
    console.log('User:', user);
    console.log('Is in game:', isInGame);
    console.log('Current game:', currentGame);

    useEffect(() => {
        console.log('useEffect triggered');
        console.log('Stored game ID:', storedGameId);
        console.log('Fetched game details:', fetchedGameDetails);
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
            onSuccess: async (response) => {
                const gameId = response.data?.gameId;
                console.log('Create game response:', response.data);
                if (gameId) {
                    localStorage.setItem('currentGameId', gameId);
                    const {data: newGameDetails} = await refetchGameDetails();
                    if (newGameDetails) {
                        setCurrentGame(newGameDetails);
                        setIsInGame(true);
                        navigate(`/lobby/${gameId}`);
                    }
                }
            },
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
            onSuccess: async () => {
                localStorage.setItem('currentGameId', joinGameId);
                const {data: joinedGameDetails} = await refetchGameDetails();
                if (joinedGameDetails) {
                    setCurrentGame(joinedGameDetails);
                    setIsInGame(true);
                    navigate(`/lobby/${joinGameId}`);
                }
            },
        });
    };

    const handleReturnToGame = () => {
        if (currentGame) {
            if (currentGame.status === GAME_STATUS.InProgress) {
                navigate(`/game/${currentGame.id}`);
            } else {
                navigate(`/lobby/${currentGame.id}`);
            }
        }
    };

    if (!user) {
        console.log('No user, rendering UserLoading');
        return <UserLoading/>;
    }

    if (isLoadingGameDetails) {
        console.log('Loading game details');
        return <div>Loading game details...</div>;
    }

    console.log('Rendering main content');
    console.log('User:', user);

    return (
        <div className="container mx-auto p-4">

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Welcome, {user.username}</h1>

                {isInGame && currentGame && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Ongoing Game</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You are currently in a game (ID: {currentGame.id})</p>
                            <p>Game Status: {currentGame.status}</p>
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
