import React from 'react';
import {
    Link
} from 'react-router-dom';

import './Menu.css';

function Menu() {
    return (
        <div className="nav-menu">
            <nav className="navbar">
                <ul className="nav-links">
                    <li className="nav-item">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/games">Game</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/settings">Settings</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Menu;
