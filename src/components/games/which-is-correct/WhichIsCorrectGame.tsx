import React, { useCallback, useState } from 'react';
import GameContainer from '../../GameContainer';
import useGame from './useGame';
import './WhichIsCorrectGame.css';
import { extractRandomElements, getRandomInt, judgeOneChoice } from '../../../utils/logic';
import { MediaComponent, icons } from './Icons';

export type Choice = {
    image: any,
    name: string,
    value: string,
    color: string,
    direction: string,
};

const GAME_STEP = {
    STARTED: 1,
    CHOICED: 2,
    JUDGED: 3,
};

function WhichIsCorrectGame() {
    const gameGenrus = ['shape', 'animal'];
    const allColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const allDirections = ['up'];
    const positionClasses = ['left-choice', 'center-choice', 'right-choice'];
    const choicesNumber = positionClasses.length;
    const [gameGenru, setGameGenru] = useState(gameGenrus[0]);
    const iconFilter = (icon) => icon.genru === gameGenru;

    function generateChoices(choicesNumber: number): Choice[] {
        const allIcons = icons.filter(iconFilter);
        const icons2 = extractRandomElements(allIcons, choicesNumber);
        const colors = extractRandomElements(allColors, choicesNumber);
        const directions = extractRandomElements(allDirections, choicesNumber, true);
        const choices: Choice[] = icons2.map((icon, index) => {
            return {
                image: MediaComponent,
                name: icon.name,
                value: icon.value,
                color: colors[index],
                direction: directions[index],
            };
        });
        return choices;
    }

    const [choices, setChoices] = useState<Choice[]>(generateChoices(choicesNumber));

    const generateAnswer = () => getRandomInt(choicesNumber);
    const [answerIndex, setAnswerIndex] = useState(generateAnswer());

    const [selected, setSelected] = useState(null);

    const [gameStep, setGameStep] = useState(GAME_STEP.STARTED);

    const judge: (choice: string | null) => boolean = (choice) => {
        if (!choice) return false;
        return judgeOneChoice(choice, choices[answerIndex].name);
    };

    const handleIconClick = (selected) => {
        setSelected(selected);
        setGameStep(GAME_STEP.CHOICED);
    };

    const handleJudgeClick = useCallback(() => {
        if (judge(selected)) {
            alert('Correct!');
        } else {
            alert('Incorrect...');
        }
        setGameStep(GAME_STEP.JUDGED);
    }, [selected, judge]);

    const handleClearClick = () => {
        setChoices(generateChoices(choicesNumber));
        setAnswerIndex(generateAnswer());
        setSelected(null);
        setGameStep(GAME_STEP.STARTED);
    };

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
                    onClick={() => handleIconClick(choice.name)}
                />
            );
        });
    };

    return (
        <>
            <div className="question">
                {`${choices[answerIndex].value} は  どれかな  ？`}
            </div>
            {renderImageButtons()}
            {gameStep === GAME_STEP.CHOICED &&
                <button className="judge-button" onClick={handleJudgeClick} >
                    OK
                </button>
            }
            {gameStep === GAME_STEP.JUDGED &&
                <button className="clear-button" onClick={handleClearClick} >
                    Clear
                </button>
            }
        </>
    );
}

export default WhichIsCorrectGame;
