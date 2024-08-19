export interface CreateGameRequest {
    hostPlayerName: string;
}

export interface JoinGameRequest {
    playerName: string;
}

export interface UpdateGameSettingsRequest {
    timer: number;
    maxScore: number;
}

export interface EndTurnRequest {
    winnerUserId: string;
}