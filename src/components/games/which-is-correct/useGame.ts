import { useCallback } from 'react';
import { extractRandomElements, getRandomInt, judgeOneChoice } from '../../../utils/logic';
import { MediaComponent, icons } from './Icons';

export type Choice = {
    image: any,
    name: string,
    value: string,
    color: string,
    direction: string,
};

interface GameSettings {
    choicesNumber: number;
    iconFilter: (icon: typeof icons[number]) => boolean;
    allColors: string[];
    allDirections: string[];
}

function useGame(settings: GameSettings): [Choice[], string, (choice: string) => boolean] {
    const allIcons = icons.filter(settings.iconFilter);
    const icons2 = extractRandomElements(allIcons, settings.choicesNumber);
    const colors = extractRandomElements(
        settings.allColors,
        settings.choicesNumber,
    );
    const directions = extractRandomElements(
        settings.allDirections,
        settings.choicesNumber,
        true,
    );
    const choices: Choice[] = icons2.map((icon, index) => {
        return {
            image: MediaComponent,
            name: icon.name,
            value: icon.value,
            color: colors[index],
            direction: directions[index],
        };
    });

    const answer = choices[getRandomInt(choices.length)].value;
    const judge: (choice: string) => boolean = useCallback((choice) => {
        return judgeOneChoice(choice, answer);
    }, [answer]);
    return [choices, answer, judge];
}

export default useGame;
