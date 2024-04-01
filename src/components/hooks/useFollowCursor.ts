import { useEffect, useRef, useState } from 'react';

/**
 * カーソルに追従する要素の位置を管理するカスタムフック
 */
function useFollowCursor(numberOfElements: number, delays: number[]) {
    const [positions, setPositions] = useState(
        Array(numberOfElements).fill({ x: 0, y: 0 })
    );
    const timers = useRef<NodeJS.Timeout[]>([]);

    const updatePositions = (x: number, y: number) => {
        delays.forEach((delay, index) => {
            timers.current[index] = setTimeout(() => {
                setPositions((prevPositions) => {
                    const newPositions = [...prevPositions];
                    newPositions[index] = {x, y};
                    return newPositions;
                });
            }, delay);
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        updatePositions(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        updatePositions(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            timers.current.forEach(clearTimeout);
        };
    }, []);

    return positions;
}

export default useFollowCursor;
