import { useLayoutEffect, useState } from "react";

function useDimensions(ref){
    const [dimensions, setDimensions] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    useLayoutEffect(() => {
        if (ref.current) {
            const element = ref.current;
            const updateDimensions = () => {
                const rect = element.getBoundingClientRect();
                console.log(rect)
                setDimensions({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                });
            };

            updateDimensions();

            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [ref]);

    return dimensions;
}

export default useDimensions;
