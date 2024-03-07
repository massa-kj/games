import React from 'react';
import Menu from './components/Menu';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';

import Home from './components/Home';
import GameSelection from './components/GameSelection';
import WhichIsCorrectGame from './components/which-is-correct/WhichIsCorrectGame';
import Settings from './components/Settings';
import NotFound from './components/NotFound';

function App() {
    return (
        <>
            <Router>
                <Menu />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="games" >
                        <Route index={true} element={<GameSelection />} />
                        <Route path="which-is-correct" element={<WhichIsCorrectGame />} />
                    </Route>
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </>
    );
}
export default App;
