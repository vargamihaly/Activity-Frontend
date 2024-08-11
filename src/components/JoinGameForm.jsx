import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { joinGame } from '../services/gameService.ts';

const JoinGameSchema = Yup.object().shape({
    gameId: Yup.string().required('Game ID is required'),
    name: Yup.string().required('Player Name is required'),
});

const JoinGameForm = () => {
    return (
        <Formik
            initialValues={{
                gameId: '',
                name: '',
            }}
            validationSchema={JoinGameSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    await joinGame(values.gameId, values);
                    alert('Joined game successfully');
                } catch (error) {
                    console.error('Error joining game', error);
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ errors, touched, isSubmitting }) => (
                <Form>
                    <label>
                        Game ID:
                        <Field name="gameId" />
                        {errors.gameId && touched.gameId ? (
                            <div>{errors.gameId}</div>
                        ) : null}
                    </label>
                    <label>
                        Player Name:
                        <Field name="name" />
                        {errors.name && touched.name ? (
                            <div>{errors.name}</div>
                        ) : null}
                    </label>
                    <button type="submit" disabled={isSubmitting}>
                        Join Game
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default JoinGameForm;
