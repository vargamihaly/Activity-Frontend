import React from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Main from './pages/Main/Main';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import GameStats from './pages/GameStats';
import Layout from './components/Layout';
import Login from "@/pages/Login";
import { GameProvider } from './context/GameContext';
const App: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AuthProvider>
            <GameProvider>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
                    <Route path="/lobby/:gameId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
                    <Route path="/game/:gameId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
                    <Route path="/game-stats/:gameId" element={<ProtectedRoute><GameStats /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Layout>
            </GameProvider>
        </AuthProvider>
    );
};

export default App;