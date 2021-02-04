import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.scss";

export default function Stats({ editor }) {
  const [info, setInfo] = useState(0);

  useEffect(() => {
    editor.renderer.onUpdateStats = info => {
      if (info.render.frame % 3 === 0) {
        setInfo({
          /* @ts-ignore */
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          fps: info.render.fps,
          frameTime: info.render.frameTime,
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines
        });
      }
    };

    return () => {
      editor.renderer.onUpdateStats = undefined;
    };
  }, [editor]);

  return (
    <div className={styles.statsContainer}>
      <h3>Stats:</h3>
      {info && (
        <ul>
          <li>
            Memory:
            <ul>
              <li>Geometries: {(info as any).geometries}</li>
              <li>Textures: {(info as any).textures}</li>
            </ul>
          </li>
          <li>
            Render:
            <ul>
              <li>FPS: {Math.round((info as any).fps)}</li>
              <li>Frame Time: {Math.round((info as any).frameTime)}ms</li>
              <li>Calls: {(info as any).calls}</li>
              <li>Triangles: {(info as any).triangles}</li>
              <li>Points: {(info as any).points}</li>
              <li>Lines: {(info as any).lines}</li>
            </ul>
          </li>
        </ul>
      )}
    </div>
  );
}

Stats.propTypes = {
  editor: PropTypes.object
};
