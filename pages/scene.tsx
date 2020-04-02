import React, { useEffect, useCallback } from 'react'
import 'aframe'
import 'aframe-physics-system'
import { Link, useParams, useRouteMatch } from 'react-router-dom'

export default function App() {
  let { game, room } = useParams();
  let { path, url } = useRouteMatch();

  // let boardName =
  //   window.Game.BasicModule.Map[4].BoardPicker.Board._attributes.image;
  let boardName = encodeURIComponent("Board OTB.jpg");
  //https://raw.githubusercontent.com/Lida/GameAndChat/master/public/Pandemic/images/Board%20OTB.jpg
  useEffect(() => {
    const content = `
    <a-scene embedded>
      <a-assets>
        <img id="board" src="https://raw.githubusercontent.com/Lida/GameAndChat/master/public/${game}/images/${boardName}" />
      </a-assets>
    <a-entity id="rig" movement-controls>
      <a-camera fov="50" ></a-camera>
    </a-entity>
    <a-image
      src= "#board"
      static-body
      position="0 -2 -3"
      rotation="-90 0 0"
      width="6"
      height="4">
      </a-image>
    <a-box dynamic-body position="-1 0.5 -3" rotation="44 44 0" color="#4CC3D9">
    </a-box>
    <a-sphere dynamic-body position="0 1.25 -5" radius="1.25" color="#EF2D5E">
    </a-sphere>
    <a-cylinder
      dynamic-body 
      position="1 0.75 -3"
      radius="0.5"
      height="1.5"
      color="#FFC65D"
    >
    </a-cylinder>
    <a-light type="ambient" color="#445451"></a-light>
      
    <a-light type="point" intensity="2" position="2 4 4"></a-light>
    <a-sky color="#333333" />
  </a-scene>
    `;
    document.getElementById("aframe")!.innerHTML = content;
  }, [game, boardName]);

  return (
    <div>
      <div id="aframe" />
      <Link to="/">Back</Link>
      <br />
      <Link
        to={url}
        onClick={e => {
          (room);
        }}
      >
        Join Game
      </Link>
    </div>
  );
}