import React from "react";
import { Header } from "@xr3ngine/client-core/components/social//Header";
import {RdxVideo, Overlay, Controls} from 'react-html5-video-editor'
import ReactDOM from "react-dom";
import store from "@xr3ngine/client-core/redux/store";

RdxVideo.Props = {
	autoPlay: false,
	loop: false,
	controls: true,
	volume:	1.0,
	preload: "auto",
	cropEnabled: true
}



export default function Editor() {
    return (
        <div id="editor-container">
            <Header user={null} />

            <RdxVideo autoPlay loop muted poster="https://127.0.0.1:3000/video/sample5.png" store={store}>
                <Overlay />
                <Controls />
                <source src="https://127.0.0.1:3000/video/file_example_MP4_640_3MG.mp4" type="video/mp4" />
            </RdxVideo>

        </div>
    );
}