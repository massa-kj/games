import React from 'react';
import Menu from './components/navigation/Menu';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    createBrowserRouter,
    RouterProvider
} from 'react-router-dom';

import Home from './components/Home';
import GameSelection from './components/navigation/GameSelection';
import WhichIsCorrectGame from './components/games/which-is-correct/WhichIsCorrectGame';
import Settings from './components/Settings';
import NotFound from './components/NotFound';

import background from './assets/background.png';
import './index.css';
import GameContainer from './components/GameContainer';
import FollowYouGame from './components/games/follow-you/FollowYouGame';

// const router = createBrowserRouter([
//     { path: '/', element: <Home /> },
// ]);

function App() {
    // useContextを使ったアプリ設定の読み込み
    // const appSettings = React.useContext(AppSettingsContext);

    return (
        <>
            <Router>
                <div className="window" style={{ backgroundImage: `url(${background})` }}>
                    <div className="nav-area">
                        <Menu />
                    </div>
                    <div className="main-area">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="games" >
                                <Route index={true} element={<GameSelection />} />
                                <Route
                                    path="which-is-correct"
                                    element={
                                        <GameContainer>
                                            <WhichIsCorrectGame />
                                        </GameContainer>
                                    }
                                />
                                <Route
                                    path="follow-you"
                                    element={
                                        <GameContainer>
                                            <FollowYouGame />
                                        </GameContainer>
                                    }
                                />
                            </Route>
                            <Route path="settings" element={<Settings />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </>
    );
}
export default App;
