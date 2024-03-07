import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <>
            <div>
                <h1>ページが見つかりません。</h1>
                <Link to={'/'}>メニューに戻る</Link>
            </div>
        </>
    );
}

export default NotFound;
