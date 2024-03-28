export function judgeOneChoice(choice: string, answer: string) {
    return choice === answer;
}

export function judgeMultiChoices(choices: Array<string>, answers: Array<string>) {
    return choices.every(element => answers.includes(element));
}

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function extractRandomElements<T>(
    array: Array<T>,
    n: number,
    allowDuplicates: boolean = false
) {
    const result: Array<T> = [];
    const copyArray = [...array];

    while (result.length < n) {
        const index = getRandomInt(copyArray.length);
        result.push(copyArray[index]);
        if (!allowDuplicates) {
            copyArray.splice(index, 1);
        }
    }

    return result;
}
