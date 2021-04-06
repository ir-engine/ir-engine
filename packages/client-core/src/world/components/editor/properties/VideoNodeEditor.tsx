// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import { VideoProjection } from "@xr3ngine/engine/src/scene/classes/Video";
import VideoInput from "../inputs/VideoInput";
import { Video } from "@styled-icons/fa-solid/Video";
import AudioSourceProperties from "./AudioSourceProperties";
import useSetPropertySelected from "./useSetPropertySelected";

/**
 * [videoProjectionOptions contains VideoProjection options]
 * @type {object}
 */
const videoProjectionOptions = Object.values(VideoProjection).map(v => ({ label: v, value: v }));


/**
 * [VideoNodeEditor used to render editor view for property customization]
 * @param       {[type]} props
 * @constructor
 */
export default function VideoNodeEditor(props) {
  const { editor, node } = props;

  //function to handle changes in src property
  const onChangeSrc = useSetPropertySelected(editor, "src");

  //function to handle change in projection property
  const onChangeProjection = useSetPropertySelected(editor, "projection");

   //editor view for VideoNode
  return (
    <NodeEditor description={VideoNodeEditor.description} {...props}>
      { /* @ts-ignore */ }
      <InputGroup name="Video">
        <VideoInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      { /* @ts-ignore */ }
      <InputGroup name="Projection">
      { /* @ts-ignore */ }
        <SelectInput options={videoProjectionOptions} value={node.projection} onChange={onChangeProjection} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  );
}

// declairing propTypes for VideoNodeEditor
VideoNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object,
  multiEdit: PropTypes.bool
};

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = Video;

// setting description will appears on editor view
VideoNodeEditor.description = "Dynamically loads a video.";
