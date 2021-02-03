import React, {useEffect} from 'react';
import NoSSR from 'react-no-ssr';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout';
const isDev = window.location.href.includes("localhost")
export const IndexPage = (): any => {
    useEffect(() => {
        if(!isDev) window.location.href="/location/home";
    }, []);

    return (
        <Layout pageTitle="Home" login={false}>
            <NoSSR onSSR={<Loading/>}>
                <div className="redirect">Redirecting...</div>
            </NoSSR>
        </Layout>
    );
};

export default IndexPage;
