import { Plugins } from '@capacitor/core';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/src/common/components/Layout/OverlayLayout';
import React, { useEffect, useState } from 'react';
import NoSSR from 'react-no-ssr';
import { useTranslation } from 'react-i18next';

export const IndexPage = (): any => {
    const { t } = useTranslation();
    const [messageState, setMessageState] = useState("");
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
        <Layout pageTitle={t('workerTest.pageTitle')} login={false}>
            <NoSSR onSSR={<Loading/>}>
                    <div>{messageState}</div>
            </NoSSR>
        </Layout>
    );
};

export default IndexPage;
