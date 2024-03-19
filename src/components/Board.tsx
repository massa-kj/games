import React from 'react';
import './Board.css';

interface BoardProps {
    children: React.ReactNode;
}

function Board(props: BoardProps) {
    return (
        <div className="board">
            {props.children}
        </div>
    );
}

export default Board;
