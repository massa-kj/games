import React from 'react';
import './ImageComponent.css';

interface PolygonProps {
    className?: string,
    width: number,
    height: number,
    color: string,
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}

type TriangleProps = PolygonProps & {
    direction: 'up' | 'down' | 'left' | 'right',
}

interface CircleProps {
    className?: string,
    r: number,
    color: string,
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}

// 図形コンポーネント（四角形）
export function Rectangle(props: PolygonProps): React.ReactElement {
    const {
        className = '',
        width,
        height,
        color,
        onClick,
    } = props;
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: width, height: height }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect width={width} height={height} fill={color} />
            </svg>
        </div>
    );
}

function getTrianglePoints(width: number, height: number, direction: 'up' | 'down' | 'left' | 'right'): string {
    switch (direction) {
    case 'up':
        return `0,${height} ${width},${height} ${width / 2},0`;
    case 'down':
        return `0,0 ${width},${0} ${width / 2},${height}`;
    case 'left':
        return `0,0 ${0},${height} ${width},${height / 2}`;
    case 'right':
        return `${width},0 ${width},${height} ${0},${height / 2}`;
    default:
        throw new Error('Invalid direction');
    }
}

// 図形コンポーネント（星）
export function Star(props: PolygonProps): React.ReactElement {
    const {
        className,
        width,
        height,
        color,
        onClick,
    } = props;
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: width, height: height }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,0 61,35 100,35 68,57 79,100 50,75 21,100 32,57 0,35 39,35" fill={color} />
            </svg>
        </div>
    );
}

// 図形コンポーネント（五角形）
export function Pentagon(props: PolygonProps): React.ReactElement {
    const {
        className,
        width,
        height,
        color,
        onClick,
    } = props;
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: width, height: height }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,0 100,38 82,100 18,100 0,38" fill={color} />
            </svg>
        </div>
    );
}

// 図形コンポーネント（六角形）
export function Hexagon(props: PolygonProps): React.ReactElement {
    const {
        className,
        width,
        height,
        color,
        onClick,
    } = props;
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: width, height: height }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill={color} />
            </svg>
        </div>
    );
}

// 図形コンポーネント（三角形）
export function Triangle(props: TriangleProps): React.ReactElement {
    const {
        className = '',
        width,
        height,
        color,
        direction,
        onClick,
    } = props;
    const points = getTrianglePoints(width, height, direction);
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: width, height: height }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points={points} fill={color} />
            </svg>
        </div>
    );
}

// 図形コンポーネント（円）
export function Circle(props: CircleProps): React.ReactElement {
    const {
        className,
        r,
        color,
        onClick,
    } = props;
    return (
        <div
            className={`${className} figure-container`}
            style={{ width: r * 2, height: r * 2 }}
            onClick={onClick}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx={r} cy={r} r={r} fill={color} />
            </svg>
        </div>
    );
}
