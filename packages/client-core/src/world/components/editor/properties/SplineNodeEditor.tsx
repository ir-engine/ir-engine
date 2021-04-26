
import React from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import AudioInput from "../inputs/AudioInput";
import { VolumeUp } from "@styled-icons/fa-solid/VolumeUp";
import AudioSourceProperties from "./AudioSourceProperties";
import useSetPropertySelected from "./useSetPropertySelected";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

/**
 * SplineNodeEditor used to customize audio element on the scene.
 * 
 * @author Hamza Mushtaq
 * @param       {Object} props
 * @constructor
 */
export function SplineNodeEditor(props) {
  const { editor, node } = props;
  const { t } = useTranslation();
  
  SplineNodeEditor.description = t('editor:properties.audio.description');
  
  const onChangeSrc = useSetPropertySelected(editor, "src");
   //returning view to customize properties
  return (
    <NodeEditor description={SplineNodeEditor.description} {...props}>
      { /* @ts-ignore */ }
      <InputGroup name="Audio Url" label={t('editor:properties.audio.lbl-audiourl')}>
        <AudioInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  );
}

/**
 * PropTypes Defining properties for AudioNodeEditor component.
 * 
 * @author Robert Long
 * @type {Object}
 */
SplineNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object,
  multiEdit: PropTypes.bool
};

//setting icon component name
SplineNodeEditor.iconComponent = VolumeUp;

//setting description for the element
//shows this description in NodeEditor with title of element
SplineNodeEditor.description = i18n.t('editor:properties.audio.description');
export default SplineNodeEditor;