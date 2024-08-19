export interface User {
    id: string;
    username: string;
    email?: string;
    score: number | null;
    isHost: boolean | null;
}

export interface GameDetails {
    id: string;
    host: User;
    timer: number;
    maxScore: number;
    players: User[];
    rounds: Round[];
    gameStatus: GameStatus;
    enabledMethods: MethodType[];
    currentRound: Round | null;
}

export interface Round {
    id: string;
    methodType: MethodType;
    word: string;
    activePlayerUsername: string;
    roundWinnerId?: number;
}

export interface Word {
    id: number;
    value: string;
    method: string;
}

export enum  MethodType {
    Drawing = 0,       // Rajzolás
    Description = 1,   // Körülírás
    Mimic = 2,         // Mutogatás
}

export enum GameStatus
{
    Waiting = 0,
    InProgress = 1,
    Finished = 2,
}

