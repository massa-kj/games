import React, {
    useState,
} from 'react';

import ImageToggleButton from '../common/ImageToggleButton';
import { useDraggable } from '../hooks/useDraggable';

interface DraggableImageToggleButtonProps {
    image: string;
    alt: string;
    onClick?: () => void;
}

function DraggableImageToggleButton(props: DraggableImageToggleButtonProps) {
    const { x, y, handleMouseDown } = useDraggable();
    const { image, alt, onClick } = props;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                cursor: 'move',
            }}
            onMouseDown={handleMouseDown}
        >
            <ImageToggleButton image={image} alt={alt} onClick={onClick}/>
        </div>
    );
}

export default DraggableImageToggleButton;
