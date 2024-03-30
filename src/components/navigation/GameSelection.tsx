import React from 'react';
import { useNavigate } from 'react-router-dom';

// import './Menu.css';
import './GameSelection.css';
import GameContainer from '../GameContainer';

function GameSelection() {
    const navigate = useNavigate();
    const startGame = (url: string) => {
        return () => {
            // 押下感のための待機時間
            setTimeout(() => {
                navigate(url);
            }, 200);
        };
    };

    return (
        <GameContainer>
            <ul className="nav-links">
                <button className="menu-button" onClick={startGame('which-is-correct')}>
                    Which is correct?
                </button>
                <button className="menu-button" onClick={startGame('follow-you')}>
                    Follow you!
                </button>
                <button className="menu-button" onClick={startGame('which-is-correct')}>
                    Which is correct?
                </button>
                <button className="menu-button" onClick={startGame('which-is-correct')}>
                    Which is correct?
                </button>
                <button className="menu-button" onClick={startGame('which-is-correct')}>
                    Which is correct?
                </button>
            </ul>
        </GameContainer>
    );
}

export default GameSelection;
