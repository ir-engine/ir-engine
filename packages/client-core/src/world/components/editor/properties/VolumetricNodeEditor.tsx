// @ts-nocheck
import { Video } from "@styled-icons/fa-solid/Video";
import PropTypes from "prop-types";
import React from "react";
import InputGroup from "../inputs/InputGroup";
import VolumetricInput from "../inputs/VolumetricInput";
import AudioSourceProperties from "./AudioSourceProperties";
import NodeEditor from "./NodeEditor";
import useSetPropertySelected from "./useSetPropertySelected";

/**
 * [VolumetricNodeEditor provides the editor view to customize properties]
 * @param       {[type]} props
 * @constructor
 */
export default function VolumetricNodeEditor(props) {
  const { editor, node } = props;

  //function to handle the change in src property
  const onChangeSrc = useSetPropertySelected(editor, "src");

   //returning editor view
  return (
    <NodeEditor description={VolumetricNodeEditor.description} {...props}>
      <InputGroup name="Volumetric">
        <VolumetricInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  );
}

VolumetricNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object,
  multiEdit: PropTypes.bool
};

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = Video;

//setting description and will appear on editor view
VolumetricNodeEditor.description = "Dynamically loads a volumetric video.";
