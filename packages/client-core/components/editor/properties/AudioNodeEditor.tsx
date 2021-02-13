import React from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import AudioInput from "../inputs/AudioInput";
import { VolumeUp } from "@styled-icons/fa-solid/VolumeUp";
import AudioSourceProperties from "./AudioSourceProperties";
import useSetPropertySelected from "./useSetPropertySelected";


/**
 * [AudioNodeEditor used to customize audio element on the scene]
 * @param       {Object} props
 * @constructor
 */
export default function AudioNodeEditor(props) {
  const { editor, node } = props;
  const onChangeSrc = useSetPropertySelected(editor, "src");
   //returning view to customize properties
  return (
    <NodeEditor description={AudioNodeEditor.description} {...props}>
      { /* @ts-ignore */ }
      <InputGroup name="Audio Url">
        <AudioInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  );
}

/**
 * [propTypes Defining properties for AudioNodeEditor component]
 * @type {Object}
 */
AudioNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object,
  multiEdit: PropTypes.bool
};

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUp;

//setting description for the element
//shows this description in NodeEditor with title of element
AudioNodeEditor.description = "Dynamically loads audio.";
