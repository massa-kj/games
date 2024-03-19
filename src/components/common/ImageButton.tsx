import React, {
    useState,
} from 'react';

import './ImageButton.css';
import '../which-is-correct/figures.css';

interface ImageButtonProps {
    className?: string;
    width?: number;
    height?: number;
    image: string;
    alt: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function ImageButton(props: ImageButtonProps) {
    const {
        className = '',
        width = 'auto',
        height = 'auto',
        image,
        alt,
        onClick
    } = props;
    const [isSelected, setIsSelected] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsSelected(!isSelected);
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button
            className={`image-button ${className}`}
            onClick={handleClick}
        >
            <img
                src={image}
                alt={alt}
                className="button-image"
                style={{
                    width: width,
                    height: height,
                }}
            />
        </button>
    );
}

export default ImageButton;
