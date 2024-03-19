import React, { useCallback, useState } from 'react';
import Board from '../Board';
import useGame from './useGame';
import './WhichIsCorrectGame.css';

function WhichIsCorrectGame() {
    const gameGenrus = ['shape', 'animal'];
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const directions = ['up'];
    const positionClasses = ['left-choice', 'center-choice', 'right-choice'];

    const [gameGenru, setGameGenru] = useState(gameGenrus[0]);
    const [selected, setSelected] = useState('');

    const [choices, answer, judge] = useGame({
        choicesNumber: positionClasses.length,
        iconFilter: icon => icon.genru === gameGenru,
        allColors: colors,
        allDirections: directions,
    });

    const judgeClick = useCallback(() => {
        if (judge(selected)) {
            alert('Correct!');
        } else {
            alert('Incorrect...');
        }
    }, [selected, judge]);

    const renderImageButtons = (): JSX.Element[] => {
        return choices.map((choice, index) => {
            const Icon = choice.image;
            return (
                <Icon
                    key={index}
                    type={choice.name}
                    className={`${selected === choice.name ? 'selected rotate' : ''} ${positionClasses[index]}`}
                    width={100}
                    height={100}
                    color={choice.color}
                    direction={choice.direction}
                    onClick={() => setSelected(choice.name)}
                />
            );
        });
    };

    return (
        <Board>
            <h1>{`${answer} は  どれかな  ？`}</h1>
            {renderImageButtons()}
            <button onClick={judgeClick} disabled={!selected} >
                OK
            </button>
        </Board>
    );
}

export default WhichIsCorrectGame;
