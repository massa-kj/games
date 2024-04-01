import './GameContainer.css';
import useWindowSize from './hooks/useWindowSize';

interface GameContainerProps {
    children: React.ReactNode;
}

function GameContainer(props: GameContainerProps) {
    const size = useWindowSize();
    const height = size.height ? size.height * 0.8 : 0;
    const width = size.width ? size.width * 0.8 : 0;

    return (
        <div
            style={{
                position: 'absolute',
                width: width,
                height: height
            }}
            className="game-container board"
        >
            {props.children}
        </div>
    );
}

export default GameContainer;
