import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { initialize } from './util';

// Initialize i18n and client-core
initialize()

// then load the app
.then(_ => {
    const StoreProvider = React.lazy(() => import('./pages/_app'));
    ReactDOM.render(
        <Suspense fallback="Loading...">
            {/* @ts-ignore */}
            <StoreProvider />
        </Suspense>,
        document.getElementById('root')
    );
});
