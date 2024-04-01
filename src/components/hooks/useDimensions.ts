import { useEffect, useState } from 'react';

function useDimensions(ref: React.RefObject<HTMLElement>) {
    const [dimensions, setDimensions] = useState({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (ref.current) {
            const updateDimensions = () => {
                const rect = ref.current!.getBoundingClientRect();
                setDimensions({
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    width: rect.width,
                    height: rect.height,
                });
            };

            updateDimensions();

            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [ref.current]);

    return dimensions;
}

export default useDimensions;
