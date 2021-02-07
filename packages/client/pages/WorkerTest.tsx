import { Plugins } from '@capacitor/core';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
import React, { useEffect, useState } from 'react';
import NoSSR from 'react-no-ssr';

export const IndexPage = (): any => {
    const [messageState, setMessageState] = useState("")
    useEffect(() => {
        const worker = new Worker(new URL('../components/deep-thought.js', import.meta.url));
        worker.postMessage({
          question:
            'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
        });
        worker.onmessage = ({ data: { answer } }) => {
          console.log(answer);
          setMessageState(answer);
        };
    }, []);

    return (
        <Layout pageTitle="Worker Test" login={false}>
            <NoSSR onSSR={<Loading/>}>
                    <div>{messageState}</div>
            </NoSSR>
        </Layout>
    );
};

export default IndexPage;
