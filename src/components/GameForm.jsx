import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { createGame } from '../services/gameService.ts';

const GameSchema = Yup.object().shape({
    methods: Yup.string().required('Methods are required'),
    timer: Yup.number().min(1, 'Timer must be at least 1 second').required('Timer is required'),
    maxScore: Yup.number().min(1, 'Max score must be at least 1').required('Max score is required'),
});

const GameForm = () => {
    return (
        <Formik
            initialValues={{
                methods: '',
                timer: 0,
                maxScore: 0,
            }}
            validationSchema={GameSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const gameId = await createGame(values);
                    alert(`Game created with ID: ${gameId}`);
                } catch (error) {
                    console.error('Error creating game', error);
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ errors, touched, isSubmitting }) => (
                <Form>
                    <label>
                        Methods (comma separated):
                        <Field name="methods" />
                        {errors.methods && touched.methods ? (
                            <div>{errors.methods}</div>
                        ) : null}
                    </label>
                    <label>
                        Timer:
                        <Field type="number" name="timer" />
                        {errors.timer && touched.timer ? (
                            <div>{errors.timer}</div>
                        ) : null}
                    </label>
                    <label>
                        Max Score:
                        <Field type="number" name="maxScore" />
                        {errors.maxScore && touched.maxScore ? (
                            <div>{errors.maxScore}</div>
                        ) : null}
                    </label>
                    <button type="submit" disabled={isSubmitting}>
                        Create Game
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default GameForm;
