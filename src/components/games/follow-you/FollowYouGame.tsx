import React, { useEffect, useRef, useState } from 'react';
import MovableIcon, { Position } from './MovableIcon';
import useDimensions from '../../hooks/useDimensions';

function FollowYouGame() {
    const icons = ['penguin'];
    // const icons = ['monkey', 'koala', 'penguin'];
    // const icons = ['monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey'];

    const initialPositions: Position[] = new Array(icons.length).fill({ x: -1000, y: -1000 });
    const [positions, setPositions] = useState<Position[]>(initialPositions);

    const ref = useRef(null);
    const dimensions = useDimensions(ref);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            positions.map((_, i) => {
                return setTimeout(() => {
                    setPositions((prev) => {
                        const newPositions = [...prev];
                        newPositions[i] = {
                            x: event.clientX > 100 ? event.clientX - 100 : 0,
                            y: event.clientY > 200 ? event.clientY - 200 : 0,
                        };
                        return newPositions;
                    });
                }, 200 * (i + 1));
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [positions]);

    const objs = positions.map((position, i) => (
        <MovableIcon key={i} iconName={icons[i]} position={position} />
    ));

    return (
        <div ref={ref} style={{ width: '100%', height: '100%' }}>
            {objs}
        </div>
    )
}

export default FollowYouGame;
