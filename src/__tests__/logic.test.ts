import { judgeMultiChoices, judgeOneChoice } from '../utils/logic';

test('renders without crashing', () => {
    expect(judgeOneChoice('aaa', 'aaa')).toBeTruthy();
    expect(judgeOneChoice('aaa', 'bbb')).toBeFalsy();
});

test('renders without crashing', () => {
    const correctChoices = ['a', 'c'];
    const wrongChoices = ['a', 'z'];
    const answers = ['a', 'b', 'c', 'd', 'e'];
    expect(judgeMultiChoices(correctChoices, answers)).toBeTruthy();
    expect(judgeMultiChoices(wrongChoices, answers)).toBeFalsy();
});
