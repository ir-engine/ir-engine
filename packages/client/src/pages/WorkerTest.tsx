import Loading from '../components/Scene/loading';
import Layout from '../components/Layout/Layout';
import React, { useEffect, useState } from 'react';
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
            <div>{messageState}</div>
        </Layout>
    );
};

export default IndexPage;
