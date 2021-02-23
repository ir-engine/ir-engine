import { Plugins, Capacitor } from '@capacitor/core';
import "@xr3ngine/native-plugin-xr/src/index.ts";

import React, { useEffect, useState } from 'react';

const { isNative } = Capacitor;

export const IndexPage = (): any => {
    const [ initializationResponse, setInitializationResponse ] = useState("");
    const [ secondState, setSecondState ] = useState("");

    useEffect(() => {
        (async function() {
            const { XRPlugin } = Plugins;

        (XRPlugin).initialize({}).then(response => {
            setInitializationResponse(response.status);
        });

        (XRPlugin).start({}).then(() => {
            setSecondState(isNative ? "Camera started on native" : "Camera started on web");
        })
    })();
    }, []);

    // useEffect(() => {
    //     setSecondState("Initialized and effected");
    // }, [initializationResponse]);

    return (
        <div className="plugintest">
            <div className="plugintestReadout">
                <p>{initializationResponse}</p>
                <p>{secondState}</p>
            </div>
        </div>
    );
};

export default IndexPage;
