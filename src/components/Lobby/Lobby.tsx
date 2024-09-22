import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { useStartGame, useGameDetails } from "@/hooks/gameHooks";
import UpdateSettingsForm from "../forms/updateSettings/UpdateSettingsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Settings, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import useSSE from '@/hooks/useSSE';
import {components} from "@/api/activitygame-schema";

type PlayerResponse = components['schemas']['PlayerResponse'];


const Lobby: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { user } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const { toast } = useToast();
    const { isLoading, error } = useGameDetails(gameId!);
    const startGameMutation = useStartGame();
    const { currentGame, refreshGameDetails } = useGame();
    const navigate = useNavigate();

    const onGameStarted = () => {
        toast({
            title: "Game Started",
            description: "The game has begun! Redirecting to game page...",
        });
        navigate(`/game/${gameId}`);
    };

    const { isConnected } = useSSE(gameId, onGameStarted);

    useEffect(() => {
        if (gameId) {
            refreshGameDetails();
        }
    }, [gameId, refreshGameDetails]);

    const handleStartGame = async () => {
        if (!gameId) {
            toast({
                title: "Error",
                description: "Please enter a valid game ID",
                variant: "destructive",
            });
            return;
        }

        try {
            await startGameMutation.mutateAsync(gameId);
            // The navigation to the game page will be handled by the SSE event
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start game. Please try again.",
                variant: "destructive",
            });
        }
    };

    const onGameIdClicked = async () => {
        if (!gameId) return;

        try {
            await navigator.clipboard.writeText(gameId);
            toast({
                title: "Copied",
                description: "Game ID copied to clipboard!",
                variant: "default",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy Game ID.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        );
    }

    if (error || !currentGame) {
        return <div>Error loading game details</div>;
    }

    const isHost = currentGame.host?.id === user?.id;
    const players = currentGame.players || [];
    if (currentGame.host && !players.some(p => p.id === currentGame.host?.id)) {
        players.unshift(currentGame.host);
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Game Lobby</CardTitle>
                    <Badge
                        variant="secondary"
                        className="mx-auto mt-2 cursor-pointer"
                        onClick={onGameIdClicked}
                    >
                        Game ID: {gameId}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Players:</h2>
                    {players.length > 0 ? (
                        <ul className="space-y-4">
                            {players.map((player: PlayerResponse) => (
                                <li key={player.id} className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarFallback>{player.username![0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {player.id === user?.id ? `${player.username} (You)` : player.username}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {player.isHost ? (
                                                <span className="flex items-center">
                                                    <Star className="h-4 w-4 mr-1 text-yellow-500"/>
                                                    Host
                                                </span>
                                            ) : 'Player'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No players in the game yet.</p>
                    )}
                    <div className="mt-6 space-y-4">
                        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Settings className="mr-2 h-4 w-4"/>
                                    {showSettings ? 'Hide Settings' : 'Show Settings'}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                                <UpdateSettingsForm
                                    gameId={gameId!}
                                    timer={currentGame.timer || 1}
                                    maxScore={currentGame.maxScore || 1}
                                    enabledMethods={currentGame.enabledMethods || []}
                                    onSuccess={async () => {
                                        await refreshGameDetails();
                                        toast({
                                            title: "Success",
                                            description: "Game settings updated successfully!"
                                        });
                                    }}
                                    isDisabled={!isHost}
                                />
                            </CollapsibleContent>
                        </Collapsible>

                        {isHost && (
                            <>
                                <Button
                                    onClick={handleStartGame}
                                    className="w-full"
                                    disabled={startGameMutation.isPending || players.length < 2}
                                >
                                    {startGameMutation.isPending ? 'Starting...' : 'Start Game'}
                                </Button>
                                {players.length < 2 && (
                                    <p className="text-sm text-red-500 mt-2">
                                        At least 2 players are required to start the game.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Lobby;
