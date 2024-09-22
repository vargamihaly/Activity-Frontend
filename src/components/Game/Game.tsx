import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {useGame} from '@/context/GameContext';
import {useEndTurn, useGameDetails} from "@/hooks/gameHooks";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2, MessageCircle} from 'lucide-react';
import {useToast} from "@/hooks/use-toast";
import useSSE from '@/hooks/useSSE';
import useGameTimer from '@/hooks/useGameTimer';
import CurrentRound from './CurrentRound';
import WinnerSelection from './WinnerSelection';
import TimerDisplay from './TimerDisplay';
import Leaderboard from './Leaderboard';

const Game: React.FC = () => {
    const {gameId} = useParams<{ gameId: string }>();
    const {user} = useAuth();
    const navigate = useNavigate();
    const {currentGame, setCurrentGame, setIsInGame} = useGame();
    const {toast} = useToast();
    const endTurnMutation = useEndTurn();
    const {data: gameDetails, refetch: reFetchGameDetails} = useGameDetails(gameId);
    const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');

    const {timeLeft, progress, startTimer, resetTimer} = useGameTimer({
        initialTime: currentGame?.timer ? currentGame.timer * 60 : 0,
        onTimeUp: () => {
            toast({title: "Time's up!", description: "The turn has ended."});
        }
    });

    const onGameEnded = () => {
        toast({
            title: "Game Over",
            description: "The game has ended! Redirecting to stats page...",
        });
        setIsInGame(false);
        setCurrentGame(null);
        navigate(`/game-stats/${gameId}`);
    };

    const onRoundEnded = () => {
        console.log('Round ended, resetting timer and selected winner');
        resetTimer();
        setSelectedWinnerId('');
    };

    const {isConnected} = useSSE(gameId, undefined, onGameEnded, onRoundEnded);

    useEffect(() => {
        if (gameId) {
            reFetchGameDetails();
        }
    }, [gameId, reFetchGameDetails]);

    useEffect(() => {
        if (gameDetails) {
            setCurrentGame(gameDetails);
            resetTimer(gameDetails.timer * 60);
            startTimer();
        }
    }, [gameDetails, setCurrentGame, resetTimer, startTimer]);

    const handleEndTurn = async () => {
        if (!selectedWinnerId || !gameId) {
            toast({
                title: "Error",
                description: "Please select a winner and ensure game ID is available.",
                variant: "destructive"
            });
            return;
        }
        
        await endTurnMutation.mutateAsync({gameId, request: {winnerUserId: selectedWinnerId}});
        toast({
            title: "Success",
            description: "Turn ended successfully. New turn started!",
        });
    };

    if (!currentGame) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            </div>
        );
    }

    const currentRoundNumber = currentGame.currentRound
        ? (currentGame.currentRound.id.charAt(currentGame.currentRound.id.length - 1) as unknown as number)
        : 0;
    const isActivePlayer = user?.username === currentGame.currentRound?.activePlayerUsername;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2">Activity Game</h1>
                <p className="text-xl text-gray-600">
                    Round {currentRoundNumber} of {currentGame.maxScore}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <CurrentRound
                                methodType={currentGame.currentRound?.methodType!}
                                word={currentGame.currentRound?.word ?? ''}
                                activePlayerUsername={currentGame.currentRound?.activePlayerUsername ?? ''}
                                isActivePlayer={isActivePlayer}
                            />
                            {isActivePlayer && (
                                <WinnerSelection
                                    players={currentGame.players!}
                                    activePlayerUsername={currentGame.currentRound?.activePlayerUsername ?? ''}
                                    selectedWinnerId={selectedWinnerId}
                                    onWinnerSelect={setSelectedWinnerId}
                                    onEndTurn={handleEndTurn}
                                    isEndingTurn={endTurnMutation.isPending}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <MessageCircle className="mr-2 h-5 w-5"/>
                                Game Chat
                            </h3>
                            <div className="bg-secondary/10 p-4 rounded-lg h-32 mb-4">
                                <p className="text-gray-500 italic">Chat functionality coming soon...</p>
                            </div>
                            <div className="flex">
                                <input type="text" placeholder="Type your message..."
                                       className="flex-grow mr-2 p-2 border rounded" disabled/>
                                <Button disabled>Send</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <TimerDisplay timeLeft={timeLeft} progress={progress}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <Leaderboard players={currentGame.players!} currentUserId={user?.id ?? ''}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Game;