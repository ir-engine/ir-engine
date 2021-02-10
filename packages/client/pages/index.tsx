import React, {useEffect} from 'react';
import Head from 'next/head';
import NoSSR from 'react-no-ssr';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
const isDev = typeof window !== "undefined" && window?.location?.href?.includes("127.0.0.1");
import { Plugins } from '@capacitor/core';
const { Example } = Plugins;
import Xr3engineContact from '../components/xr3engineContact';

export const IndexPage = (): any => {
    useEffect(() => {
        if(Example){
            Example.echo({value: 'hello'}).then(data => {
                console.log(data);
            });
        }
        else if(!isDev) window.location.href="/location/home";
    }, []);

    return (
        <div className="lander">
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap" rel="stylesheet"/>
            </Head>
            <div className="lander-container">
                <div className="row mb-padding">
                    <object className="lander-logo" data="static/overlay_mark.svg"></object>
                </div>
                <div className="logo-bottom mb-padding">
                    <span className="main-txt gray-txt mr-2">BY</span>
                    <span className="main-txt gradiant-txt mr-2">LAGUNA</span>
                    <span className="main-txt white-txt">LABS</span>
                </div>
                <div className="row mt-5">
                    <div className="bottom-left mb-padding">
                        <div className="main-txt width-400">
                            Realtime social apps for everyone, at metaverse scale.
                        </div>
                        <button type="button" className="button main-button">
                            Try The Demo
                        </button>
                    </div>
                    <object className="main-background" data="static/main-background.png"></object>
                    <div className="contact-right-div">
                        <Xr3engineContact />
                    </div>
                </div>
                <div className="right-top-menu-row row">
                    <div className="right-top-menu">
                        <object className="mr-4 discord-icon" data="static/discord.svg"></object>
                        <object className="github-icon" data="static/github.svg"></object>
                    </div>
                </div>
            </div>
        </div>
        // <Layout pageTitle="Home" login={false} >
        //     <NoSSR onSSR={<Loading/>}>
        //         {Example &&
        //             <div>Native plugin detected</div>
        //         }
        //         <div className="redirect">Redirecting...</div>
        //     </NoSSR> 
            
        // </Layout>
    );
};

export default IndexPage;
