export interface Player {
    id: number;
    name: string;
    score: number;
    isHost: boolean;
}

export interface GameDetails {
    gameId: string;
    host: Player;
    isStarted: boolean;
    methods: string[];
    timer: number;
    maxScore: number;
    players: Player[];
}