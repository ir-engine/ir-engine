import React, {useEffect} from 'react';
import NoSSR from 'react-no-ssr';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
const isDev = typeof window !== "undefined" && window?.location?.href?.includes("localhost");
import { Plugins } from '@capacitor/core';
const { Example } = Plugins;

export const IndexPage = (): any => {
    useEffect(() => {
        if(Example){
            Example.echo({value: 'hello'}).then(data => {
                console.log(data)
            });
        }
        else if(!isDev) window.location.href="/location/home";
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
