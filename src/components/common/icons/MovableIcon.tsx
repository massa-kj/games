import { Icon } from './Icon';

interface MovableIconProps {
    iconName: string,
    style: any,
    width: number,
    height: number,
}

function MovableIcon(props: MovableIconProps) {
    const {
        iconName,
        style,
        width,
        height
    } = props;
    return (
        <div
            style={{...style}}
        >
            <Icon
                type={iconName}
                width={width}
                height={height}
            />
        </div>
    );
}

export default MovableIcon;
