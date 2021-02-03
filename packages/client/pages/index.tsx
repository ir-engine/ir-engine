import React, {useEffect} from 'react';
import NoSSR from 'react-no-ssr';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout';

export const IndexPage = (props: any): any => {
    useEffect(() => {
        window.location.href="https://lagunalabs.io";
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
