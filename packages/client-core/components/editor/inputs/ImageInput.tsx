import React from "react";
import PropTypes from "prop-types";
import { ControlledStringInput } from "./StringInput";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../dnd";
import useUpload from "../assets/useUpload";
import { ImageFileTypes } from "../assets/fileTypes";

/**
 * [used to set uploadOptions]
 * @type {Object}
 */
const uploadOptions = {
  multiple: false,
  accepts: ImageFileTypes
};

/**
 * [ImageInput used to render component view for image inputs]
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export default function ImageInput({ onChange, ...rest }) {
  const onUpload = useUpload(uploadOptions);
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Image, ItemTypes.File],
    drop(item: any) {
      if (item.type === ItemTypes.Image) {
        onChange(item.value.url, item.value.initialProps || {});
      } else {
        onUpload(item.files).then(assets => {
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
// creating view for component.
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
 * [declaring proptoTtypes for Component]
 * @type {Object}
 */
ImageInput.propTypes = {
  onChange: PropTypes.func.isRequired
};
