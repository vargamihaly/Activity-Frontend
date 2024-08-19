import {User, Word, Round, MethodType, GameStatus} from './GameTypes';

export interface ApiResponse<T = void> {
    success: boolean;
    message: string;
    data?: T;
}


// Represents the response when a game starts
export interface StartGameResponse {
    nextActivePlayer: string;
    nextWord: string;
    methodType: string;  // Backend sends this as a string representation of the MethodType
}

// Represents the response when creating a game
export interface CreateGameResponse {
    gameId: string;
}

// Represents the detailed response for a game's state
export interface GameDetailsResponse {
    id: string;
    host: PlayerResponse;
    timer: number;
    maxScore: number;
    players: PlayerResponse[];
    status: GameStatus;
    currentRound?: RoundResponse;
    enabledMethods: MethodType[];
}

export interface PlayerResponse
{
    id: string;
    username: string;
    score: number;
    isHost: boolean;
}

export interface RoundResponse {
    id: string;
    methodType: MethodType;  
    word: string;
    activePlayerUsername: string; 
}

export interface EndTurnResponse {
    isGameWon: boolean;
}
