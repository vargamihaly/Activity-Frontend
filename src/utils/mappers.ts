import { GameDetailsResponse, PlayerResponse, RoundResponse } from '@/interfaces/ResponseTypes';
import { GameDetails, User, Round } from '@/interfaces/GameTypes';

export function mapGameDetailsResponseToGameDetails(response: GameDetailsResponse): GameDetails {
    return {
        id: response.id,
        host: mapPlayerResponseToUser(response.host),
        timer: response.timer,
        maxScore: response.maxScore,
        players: response.players.map(mapPlayerResponseToUser),
        rounds: [],
        gameStatus: response.status,
        currentRound: response.currentRound ? mapRoundResponseToRound(response.currentRound) : null,
        enabledMethods: response.enabledMethods,
    };
}

export function mapPlayerResponseToUser(player: PlayerResponse): User {
    return {
        id: player.id,
        username: player.username,
        score: player.score,
        isHost: player.isHost
    };
}

export function mapRoundResponseToRound(round: RoundResponse): Round {
    return {
        id: round.id,
        methodType: round.methodType,
        word: round.word,
        activePlayerUsername: round.activePlayerUsername, // Note: This might need adjustment based on your exact types
    };
}