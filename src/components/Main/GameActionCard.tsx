import React from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';

interface GameActionCardProps {
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
    isLoading: boolean;
    variant?: 'create' | 'join';
}

const GameActionCard: React.FC<GameActionCardProps> = ({ title, description, actionText, onAction, isLoading, variant = 'create' }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={onAction}
                    disabled={isLoading}
                >
                    {variant === 'create' ? (
                        <PlusCircle className="mr-2 h-4 w-4" />
                    ) : (
                        <Users className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? `${actionText}...` : actionText}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default GameActionCard;
