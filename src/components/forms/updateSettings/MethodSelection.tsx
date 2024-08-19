import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { MethodType } from '@/interfaces/GameTypes';
import React from "react";

interface MethodSelectionProps {
    methods: number[];
    onToggle: (method: number) => void;
    error?: string;
    touched?: boolean;
    disabled?: boolean;
}

const MethodSelection: React.FC<MethodSelectionProps> = ({ methods, onToggle, error, touched, disabled }) => {
    return (
        <>
            <Typography variant="subtitle1">Game Methods:</Typography>
            <FormGroup>
                {Object.keys(MethodType)
                    .filter((key) => isNaN(Number(key)))
                    .map((method) => (
                        <FormControlLabel
                            key={method}
                            control={
                                <Checkbox
                                    name="methods"
                                    checked={methods.includes(MethodType[method as keyof typeof MethodType])}
                                    onChange={() => {
                                        const selectedMethod = MethodType[method as keyof typeof MethodType];
                                        onToggle(selectedMethod);
                                    }}
                                    disabled={disabled}  // Add this line
                                />
                            }
                            label={method}
                        />
                    ))}
            </FormGroup>
            {touched && error && <Typography color="error">{error}</Typography>}
        </>
    );
};

export default MethodSelection;