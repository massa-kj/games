import React, { useState, useEffect } from 'react';

export function useDraggable() {
    const [state, setState] = useState({
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
    });

    const handleMouseDown = (event) => {
        setState(state => ({
            ...state,
            isDragging: true,
            offsetX: event.clientX - state.x,
            offsetY: event.clientY - event.y,
        }));
    };

    const handleMouseMove = (event) => {
        if (state.isDragging) {
            const x = event.clientX - state.offsetX;
            const y = event.clientY - state.offsetY;
            setState(state => ({...state, x, y}));
        }
    };

    const handleMouseUp = () => {
        if (state.isDragging) {
            setState(state => ({...state, isDragging: false}));
        }
    };

    useEffect(() => {
        if (state.isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [state.isDragging]);

    return {
        x: state.x,
        y: state.y,
        handleMouseDown,
    };
}
