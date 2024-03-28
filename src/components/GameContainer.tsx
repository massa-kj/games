import React from 'react';
import './GameContainer.css';

interface GameContainerProps {
    children: React.ReactNode;
}

function GameContainer(props: GameContainerProps) {
    return (
        <div className="game-container board">
            {props.children}
        </div>
    );
}

export default GameContainer;
