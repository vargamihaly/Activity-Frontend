import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { useEndTurn } from "@/hooks/gameHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Timer, Crown, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { User, MethodType } from '@/interfaces/GameTypes';
import { Progress } from "@/components/ui/progress";
import { EndTurnRequest } from "@/interfaces/RequestTypes";
import useSSE from '@/hooks/useSSE';

const Game: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { currentGame, setCurrentGame, setIsInGame, refreshGameDetails } = useGame();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [progress, setProgress] = useState(100);
    const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
    const { toast } = useToast();

    const endTurnMutation = useEndTurn();

    const onGameEnded = (winnerId: string) => {
        toast({
            title: "Game Over",
            description: "The game has ended! Redirecting to stats page...",
        });
        setIsInGame(false);
        setCurrentGame(null);
        navigate(`/game-stats/${gameId}`);
    };

    const { isConnected } = useSSE(gameId, undefined, onGameEnded);

    useEffect(() => {
        if (gameId) {
            refreshGameDetails();
        }
    }, [gameId, refreshGameDetails]);

    useEffect(() => {
        if (currentGame) {
            setTimeLeft(currentGame.timer * 60);
        }
    }, [currentGame]);

    useEffect(() => {
        if (timeLeft > 0 && currentGame) {
            const totalTime = currentGame.timer * 60;
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    setProgress((newTime / totalTime) * 100);
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timerId);
        }
    }, [timeLeft, currentGame]);

    const handleEndTurn = async () => {
        if (!selectedWinnerId || !gameId) {
            toast({
                title: "Error",
                description: "Please select a winner and ensure game ID is available.",
                variant: "destructive"
            });
            return;
        }

        const endTurnRequest: EndTurnRequest = {
            winnerUserId: selectedWinnerId
        };

        try {
            await endTurnMutation.mutateAsync({ gameId, request: endTurnRequest });
            toast({
                title: "Success",
                description: "Turn ended successfully. New turn started!",
            });
            setTimeLeft(currentGame?.timer! * 60 || 0);
            setSelectedWinnerId('');
            refreshGameDetails();
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to end turn: ${(error as Error).message}`,
                variant: "destructive",
            });
        }
    };

    if (!currentGame) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const currentRoundNumber = currentGame.rounds.findIndex(round => round.id === currentGame.currentRound?.id) + 1;
    const isActivePlayer = user?.username === currentGame.currentRound?.activePlayerUsername;

    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2">Activity Game</h1>
                <p className="text-xl text-gray-600">
                    Round {currentRoundNumber} of {currentGame.maxScore}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Current Round</h2>
                            <div className="bg-primary/10 p-4 rounded-lg">
                                <p className="text-lg mb-2">
                                    <strong>Method:</strong> {MethodType[currentGame.currentRound?.methodType ?? 0]}
                                </p>
                                <p className="text-3xl font-bold text-primary">{currentGame.currentRound?.word}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Active Player</h3>
                            <div className="flex items-center bg-secondary/20 p-3 rounded-lg">
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>{currentGame.currentRound?.activePlayerUsername[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-lg font-medium">{currentGame.currentRound?.activePlayerUsername}</span>
                                {isActivePlayer && <Badge className="ml-auto bg-primary">It's your turn!</Badge>}
                            </div>
                        </div>

                        {isActivePlayer && (
                            <div className="space-y-4">
                                <Select onValueChange={(value) => setSelectedWinnerId(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Winner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentGame.players.map((player) => (
                                            <SelectItem key={player.id} value={player.id}>{player.username}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleEndTurn}
                                    disabled={!selectedWinnerId || endTurnMutation.isPending}
                                    className="w-full"
                                >
                                    {endTurnMutation.isPending ? 'Ending Turn...' : 'End Turn'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <Timer className="mr-2 h-5 w-5" />
                                Time Remaining
                            </h3>
                            <div className="text-4xl font-bold text-center mb-4">
                                {formatTimeLeft(timeLeft)}
                            </div>
                            <Progress value={progress} className="w-full" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <Crown className="mr-2 h-5 w-5" />
                                Leaderboard
                            </h3>
                            <ul className="space-y-3">
                                {currentGame.players.sort((a, b) => b.score! - a.score!).map((player: User, index: number) => (
                                    <li key={player.id} className="flex items-center justify-between bg-secondary/10 p-2 rounded">
                                        <div className="flex items-center">
                                            <span className="font-semibold mr-2">{index + 1}.</span>
                                            <Avatar className="h-8 w-8 mr-2">
                                                <AvatarFallback>{player.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{player.id === user?.id ? `${player.username} (You)` : player.username}</span>
                                        </div>
                                        <Badge variant={index === 0 ? "default" : "secondary"}>{player.score}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="mt-6">
                <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Game Chat
                    </h3>
                    <div className="bg-secondary/10 p-4 rounded-lg h-32 mb-4">
                        <p className="text-gray-500 italic">Chat functionality coming soon...</p>
                    </div>
                    <div className="flex">
                        <input type="text" placeholder="Type your message..." className="flex-grow mr-2 p-2 border rounded" disabled />
                        <Button disabled>Send</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Game;