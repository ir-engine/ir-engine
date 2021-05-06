import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

// then load the app

const Index = React.lazy(() => import('./pages/index'));
ReactDOM.render(
    <Suspense fallback="Loading...">
        <Index />
    </Suspense>,
    document.getElementById('root')
);
