import ImageComponent from './ImageComponent';
import { Circle, Hexagon, Pentagon, Rectangle, Star, Triangle } from './figures';
import monkey from '../../../../src/assets/monkey.PNG';
import koala from '../../../../src/assets/koala.PNG';
import penguin from '../../../../src/assets/penguin.PNG';

const ICON_NAMES = {
    RECTANGLE: 'rectangle',
    STAR: 'star',
    PENTAGON: 'pentagon',
    HEXAGON: 'hexagon',
    TRIANGLE: 'triangle',
    CIRCLE: 'circle',
    MONKEY: 'monkey',
    KOALA: 'koala',
    PENGUIN: 'penguin',
} as const;

export const icons = [
    {
        name: 'rectangle',
        value: 'しかく',
        iconType: 'svg',
        genru: 'shape',
    },
    {
        name: 'star',
        value: 'ほし',
        iconType: 'svg',
        genru: 'shape',
    },
    // {
    //     name: 'pentagon',
    //     value: 'ごかっけい',
    //     iconType: 'svg',
    //     genru: 'shape',
    // },
    // {
    //     name: 'hexagon',
    //     value: 'ろっかっけい',
    //     iconType: 'svg',
    //     genru: 'shape',
    // },
    {
        name: 'triangle',
        value: 'さんかく',
        iconType: 'svg',
        genru: 'shape',
    },
    {
        name: 'circle',
        value: 'まる',
        iconType: 'svg',
        genru: 'shape',
    },
    {
        name: 'monkey',
        value: 'さる',
        iconType: 'image',
        genru: 'animal',
    },
    {
        name: 'koala',
        value: 'こあら',
        iconType: 'image',
        genru: 'animal',
    },
    {
        name: 'penguin',
        value: 'ぺんぎん',
        iconType: 'image',
        genru: 'animal',
    },
] as const;

export const images = {
    monkey: {
        image: monkey,
        alt: ICON_NAMES.MONKEY,
    },
    koala: {
        image: koala,
        alt: ICON_NAMES.KOALA,
    },
    penguin: {
        image: penguin,
        alt: ICON_NAMES.PENGUIN,
    }
};

interface IconProps {
    className?: string;
    width: number;
    height: number;
    type: string;
    color: string;
    direction: string;
    onClick?: ((event: React.MouseEvent<HTMLDivElement>) => void) |
        ((event: React.MouseEvent<HTMLButtonElement>) => void);
}

export function Icon(props: IconProps) {
    const {
        type,
        className = '',
        width,
        height,
        color,
        direction,
        onClick,
    } = props;
    switch (type) {
    case ICON_NAMES.RECTANGLE:
        return (
            <Rectangle
                className={className}
                width={width}
                height={height}
                color={color}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.STAR:
        return (
            <Star 
                className={className}
                width={width}
                height={height}
                color={color}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.PENTAGON:
        return (
            <Pentagon
                className={className}
                width={width}
                height={height}
                color={color}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.HEXAGON:
        return (
            <Hexagon
                className={className}
                width={width}
                height={height}
                color={color}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.TRIANGLE:
        return (
            <Triangle 
                className={className}
                width={width}
                height={height}
                color={color}
                direction={direction as 'up' | 'down' | 'left' | 'right'}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.CIRCLE:
        return (
            <Circle 
                className={className}
                r={width / 2}
                color={color}
                onClick={onClick as ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined}
            />
        );
    case ICON_NAMES.MONKEY:
    case ICON_NAMES.KOALA:
    case ICON_NAMES.PENGUIN:
        return (
            <ImageComponent
                className={className}
                width={width}
                height={height}
                onClick={onClick as ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined}
                image={images[type].image}
                alt={images[type].alt}
            />
        );
    default:
        return null;
    }
}
