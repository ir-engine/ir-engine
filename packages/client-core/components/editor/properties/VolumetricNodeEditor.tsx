// @ts-nocheck
import { Video } from "@styled-icons/fa-solid/Video";
import PropTypes from "prop-types";
import React from "react";
import InputGroup from "../inputs/InputGroup";
import VolumetricInput from "../inputs/VolumetricInput";
import AudioSourceProperties from "./AudioSourceProperties";
import NodeEditor from "./NodeEditor";
import useSetPropertySelected from "./useSetPropertySelected";

export default function VolumetricNodeEditor(props) {
  const { editor, node } = props;
  const onChangeSrc = useSetPropertySelected(editor, "src");

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

VolumetricNodeEditor.iconComponent = Video;

VolumetricNodeEditor.description = "Dynamically loads a volumetric video.";
