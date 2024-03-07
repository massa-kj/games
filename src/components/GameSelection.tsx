import React from 'react';
import {
    Link
} from 'react-router-dom';

function GameSelection() {
    return (
        <>
            <ul>
                <li>
                    <Link to="/games/which-is-correct">Which is correct?</Link>
                </li>
            </ul>
        </>
    );
}

export default GameSelection;
