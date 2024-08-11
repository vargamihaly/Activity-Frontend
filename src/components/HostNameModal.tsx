// HostNameModal.tsx

import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { handleApiError } from '../utils/errorHandler'; // Import handleApiError

interface HostNameModalProps {
    open: boolean;
    onClose: () => void;
}

interface HostNameFormValues {
    hostPlayerName: string;
}

const HostNameSchema = Yup.object().shape({
    hostPlayerName: Yup.string().required('Name is required'),
});

const HostNameModal: React.FC<HostNameModalProps> = ({ open, onClose }) => {
    const navigate = useNavigate();

    const handleCreateGame = async (values: HostNameFormValues) => {
        try {
            const response = await fetch('http://localhost:8081/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ HostPlayerName: values.hostPlayerName }),
            });
            const data = await response.json();

            if (response.ok && data.gameId) {
                navigate(`/lobby/${data.gameId}`);
                onClose();
            } else {
                throw new Error(data.message || 'Failed to create the game');
            }
        } catch (error) {
            await handleApiError(error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Enter Your Name</DialogTitle>
            <Formik
                initialValues={{ hostPlayerName: '' }}
                validationSchema={HostNameSchema}
                onSubmit={handleCreateGame}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form>
                        <DialogContent>
                            <Field
                                as={TextField}
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Host Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                name="hostPlayerName"
                                error={touched.hostPlayerName && Boolean(errors.hostPlayerName)}
                                helperText={touched.hostPlayerName && errors.hostPlayerName}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                Create Game
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default HostNameModal;
