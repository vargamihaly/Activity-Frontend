import axios from 'axios';
import { handleApiError } from '../utils/errorHandler'; 

const API_URL = 'http://localhost:8081/api/games'; // Ensure this matches your backend URL

//
// export const createGame = async (hostPlayer: any): Promise<any> => {
//     try {
//         const response = await axios.post(API_URL, hostPlayer);
//         return response.data;
//     } catch (error) {
//         await handleApiError(error, { retryFunction: () => createGame(hostPlayer), retryCount: 1 });
//         throw error;
//     }
// };

export const createGame = async (hostPlayer: any): Promise<any> => {
    try {
        const response = await axios.post(API_URL, hostPlayer);
        return response.data;
    } catch (error) {
        await handleApiError(error); // Handle error here
        throw error; // Optionally re-throw to allow further handling in components
    }
};

export const joinGame = async (gameId: string, playerName: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/${gameId}/join`, {
            PlayerName: playerName,
        });
        return response.data;
    } catch (error) {
        await handleApiError(error, { retryFunction: () => joinGame(gameId, playerName), retryCount: 1 });
        throw error;
    }
};

export const updateSettings = async (gameId: string, settings: any): Promise<any> => {
    try {
        const response = await axios.put(`${API_URL}/${gameId}/settings`, settings);
        return response.data;
    } catch (error) {
        await handleApiError(error);
        throw error;
    }
};

export const startGame = async (gameId: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/${gameId}/start`);
        return response.data;
    } catch (error) {
        await handleApiError(error);
        throw error;
    }
};

export const getGameDetails = async (gameId: string): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/${gameId}`);
        return response.data;
    } catch (error) {
        await handleApiError(error);
        throw error;
    }
};