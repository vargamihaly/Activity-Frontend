import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { updateSettings } from '../services/gameService';

const SettingsSchema = Yup.object().shape({
    methods: Yup.string().required('Methods are required'),
    timer: Yup.number().min(1, 'Timer must be at least 1 second').required('Timer is required'),
    maxScore: Yup.number().min(1, 'Max score must be at least 1').required('Max score is required'),
});

interface UpdateSettingsFormProps {
    gameId: string;
    initialMethods: string;
    initialTimer: number;
    initialMaxScore: number;
    onSuccess: () => void;  // Callback after successful update
}

const UpdateSettingsForm: React.FC<UpdateSettingsFormProps> = ({
                                                                   gameId,
                                                                   initialMethods,
                                                                   initialTimer,
                                                                   initialMaxScore,
                                                                   onSuccess,
                                                               }) => {
    return (
        <Formik
            initialValues={{
                methods: initialMethods,
                timer: initialTimer,
                maxScore: initialMaxScore,
            }}
            validationSchema={SettingsSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    await updateSettings(gameId, values);
                    alert('Settings updated successfully');
                    onSuccess();
                } catch (error) {
                    console.error('Error updating settings', error);
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
                        Update Settings
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default UpdateSettingsForm;
