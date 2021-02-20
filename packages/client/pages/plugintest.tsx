import Head from 'next/head';
import React, { useEffect } from 'react';
import Xr3engineContact from '../components/xr3engineContact';
import { Plugins, registerWebPlugin, WebPlugin } from '@capacitor/core';
import { XRPluginPlugin } from "@xr3ngine/capacitor-plugin-xr/src/definitions";
import '@xr3ngine/capacitor-plugin-xr/src/index';

export const IndexPage = (): any => {
    useEffect(() => {
        const { XRPlugin } = Plugins;
        registerWebPlugin(XRPlugin as any);
        (XRPlugin as XRPluginPlugin).initialize({}).then(response => {
            console.log(response);
        });
    }, []);
    return (
        <div className="lander" />
    );
};

export default IndexPage;
