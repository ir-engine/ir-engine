// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import { ControlledStringInput } from "./StringInput";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../dnd";
import useUpload from "../assets/useUpload";
import { AudioFileTypes } from "../assets/fileTypes";

/**
 * [initializing uploadOptions properties]
 * @type {Object}
 */
const uploadOptions = {
  multiple: false,
  accepts: AudioFileTypes
};

/**
 * [AudioInput used to provide view]
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export default function AudioInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions);
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Audio, ItemTypes.File],
    drop(item) {
      if (item.type === ItemTypes.Audio) {
        onChange((item as any).value.url, (item as any).value.initialProps || {});
      } else {
        onUpload((item as any).files).then(assets => {
          if (assets && assets.length > 0) {
            onChange(assets[0].url, {});
          }
        });
      }
    },
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  });

/**
 * [retuning view for AudioInput]
 */
  return (
    <ControlledStringInput
      ref={dropRef}
      /* @ts-ignore */
      onChange={onChange}
      error={isOver && !canDrop}
      canDrop={isOver && canDrop}
      {...rest}
    />
  );
}

/**
 * [declairing propTypes for AudioInput]
 * @type {Object}
 */
AudioInput.propTypes = {
  onChange: PropTypes.func.isRequired
};
