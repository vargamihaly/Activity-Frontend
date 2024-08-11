import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Lobby from './components/Lobby';
import JoinGame from './components/JoinGame';
import HostNameModal from './components/HostNameModal';
import { PlayerRoleProvider } from './context/PlayerRoleContext'; // Ensure this is imported correctly

function App() {
    const [openModal, setOpenModal] = useState(false);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <PlayerRoleProvider> {/* Make sure the entire app is wrapped with the provider */}
            <Box className="App">
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Activity Game
                        </Typography>
                        <Button color="inherit" component={RouterLink} to="#" onClick={handleOpenModal}>
                            Host a Game
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/join">
                            Join a Game
                        </Button>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="md">
                    <Routes>
                        <Route path="/host" element={<Lobby />} />
                        <Route path="/join" element={<JoinGame />} />
                        <Route path="/lobby/:gameId" element={<Lobby />} />
                    </Routes>
                </Container>
                <HostNameModal open={openModal} onClose={handleCloseModal} />
            </Box>
        </PlayerRoleProvider>
    );
}

export default App;
