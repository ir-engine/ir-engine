import React from 'react'
import 'aframe';
import 'aframe-particle-system-component';
import 'babel-polyfill';
//TODO: Add types for aframe-react and remove the ignore
//@ts-ignore
import { Entity, Scene } from 'aframe-react';


export default class NetworkedScene extends React.Component {
    render() {
        return (

            <div >
                <a-scene networked-scene="room: 1;
audio: true;
adapter: janus;
serverURL: ws://localhost:3000;// To do- this will be replaced by the shard manager
" renderer="antialias: true" background="color: #FAFAFA">
                    <a-box
                        position="-1 0.5 -3"
                        rotation="0 45 0"
                        color="#4CC3D9"
                        shadow
                    ></a-box>
                </a-scene>
            </div>
        )
    }
}