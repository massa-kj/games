import React, {
    useState,
} from 'react';

import ImageButton from './ImageButton';

interface ImageToggleButtonProps {
    className?: string;
    image: string;
    alt: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ImageToggleButton(props: ImageToggleButtonProps) {
    const { className = '', image, alt, onClick } = props;
    const [isSelected, setIsSelected] = useState(false);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsSelected(!isSelected);
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <ImageButton
            className={`image-toggle-button ${isSelected ? 'selected' : ''} ${className} `}
            image={image}
            alt={alt}
            onClick={handleClick}
        />
    );
}

export default ImageToggleButton;
