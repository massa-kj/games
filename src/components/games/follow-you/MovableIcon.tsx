import { Icon } from '../../common/icons/Icon';

export interface Position {
    x: number,
    y: number,
}

function MovableIcon({ iconName, position }: { iconName: string, position: Position }) {
    const { x, y } = position;
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
            }}
        >
            <Icon
                type={iconName}
                width={150}
                height={150}
                color="pink"
                direction="up"
            />
        </div>
    );
}

export default MovableIcon;
