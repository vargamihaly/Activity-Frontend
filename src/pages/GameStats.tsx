import React from 'react';
import { useParams } from 'react-router-dom';
import { useGameDetails } from "@/hooks/gameHooks";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Clock, Target } from 'lucide-react';
import { MethodType } from '@/interfaces/GameTypes';

const GameStats: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const { data: gameDetails, isLoading, error } = useGameDetails(gameId!);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !gameDetails) {
        return <div className="text-center text-red-500 p-4">Error loading game statistics</div>;
    }

    const winner = gameDetails.players.reduce((prev, current) => (prev.score! > current.score!) ? prev : current);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Game Statistics</h1>

            <Card className="mb-6">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                        Winner
                    </h2>
                    <div className="flex items-center bg-yellow-100 p-4 rounded-lg">
                        <Avatar className="h-12 w-12 mr-4">
                            <AvatarFallback>{winner.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xl font-bold">{winner.username}</p>
                            <p className="text-lg">Score: {winner.score}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Target className="mr-2 h-6 w-6" />
                        Game Details
                    </h2>
                    <ul className="space-y-2">
                        <li><strong>Game ID:</strong> {gameDetails.id}</li>
                        <li><strong>Max Score:</strong> {gameDetails.maxScore}</li>
                        <li><strong>Timer:</strong> {gameDetails.timer} minutes</li>
                        <li><strong>Enabled Methods:</strong> {gameDetails.enabledMethods.map(method => MethodType[method]).join(', ')}</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Clock className="mr-2 h-6 w-6" />
                        Final Standings
                    </h2>
                    <ul className="space-y-4">
                        {gameDetails.players.sort((a, b) => b.score! - a.score!).map((player, index) => (
                            <li key={player.id} className="flex items-center justify-between bg-secondary/10 p-3 rounded-lg">
                                <div className="flex items-center">
                                    <span className="font-semibold mr-3">{index + 1}.</span>
                                    <Avatar className="h-10 w-10 mr-3">
                                        <AvatarFallback>{player.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-lg">{player.username}</span>
                                </div>
                                <Badge variant={index === 0 ? "default" : "secondary"} className="text-lg">
                                    {player.score}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default GameStats;