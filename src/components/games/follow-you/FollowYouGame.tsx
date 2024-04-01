import React, { useRef } from 'react';
import MovableIcon from '../../common/icons/MovableIcon';
import useDimensions from '../../hooks/useDimensions';
import useFollowCursor from '../../hooks/useFollowCursor';
import { Icon } from '../../common/icons/Icon';

function FollowYouGame() {
    // const icons = ['penguin'];
    const icons = [
        'monkey', 'koala', 'penguin',
    ];
    // const icons = [
    //     'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey', 'monkey',
    // ];

    const delays = icons.map((_, index) => index * 200);

    const ref = useRef(null);
    const area = useDimensions(ref);

    const positions = useFollowCursor(delays.length, delays);

    const objs = positions.map((position, index) => {
        const iconSize = { width: 150, height: 150 };
        const calcX = (position, iconSize, area) => {
            const iconLeft = position.x - iconSize.width / 2;
            const iconRight = position.x + iconSize.width / 2;
            if (iconLeft < area.left) {
                return area.left + iconSize.width / 2;
            }
            if (iconRight > area.right) {
                return area.right - iconSize.width / 2;
            }
            return position.x;
        };
        const calcY = (position, iconSize, area) => {
            const iconTop = position.y - iconSize.height / 2;
            const iconBottom = position.y + iconSize.height / 2;
            if (iconTop < area.top) {
                return area.top + iconSize.height / 2;
            }
            if (iconBottom > area.bottom) {
                return area.bottom - iconSize.height / 2;
            }
            return position.y;
        }
        return (
            <Icon
                key={index}
                type={icons[index]}
                style={{
                    position: 'absolute',
                    left: `${calcX(position, iconSize, area) - area.left - iconSize.width / 2}px`,
                    top: `${calcY(position, iconSize, area) - area.top - iconSize.height / 2}px`,
                }}
                width={iconSize.width}
                height={iconSize.height}
            />
        );
    });

    return (
        <div ref={ref} style={{ width: '100%', height: '100%' }}>
            {objs}
        </div>
    );
}

export default FollowYouGame;
