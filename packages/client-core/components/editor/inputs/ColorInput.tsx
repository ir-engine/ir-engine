import React, { useCallback } from "react";
import PropTypes from "prop-types";
import SketchPicker from "react-color/lib/Sketch";
import Input from "./Input";
import { Color } from "three";
import styled from "styled-components";
import Popover from "../layout/Popover";

const ColorInputContainer = (styled as any).div`
  display: flex;
  position: relative;
  width: 100%;
  max-width: 100px;
`;

const StyledColorInput = (styled as any)(Input)`
  display: flex;
  flex: 1;
  align-items: center;
`;

const ColorPreview = (styled as any).div`
  width: 32px;
  height: auto;
  border-radius: 2px;
  padding: 6px;
  margin-right: 8px;
`;

const ColorText = (styled as any).div`
  padding-top: 2px;
`;

const ColorInputPopover = (styled as any).div`
  box-shadow: ${props => props.theme.shadow30};
  margin-bottom: 3px;
`;

export default function ColorInput({ value, onChange, disabled, ...rest }) {
  const onChangePicker = useCallback(
    ({ hex }) => {
      onChange(new Color(hex));
    },
    [onChange]
  );

  const hexColor = "#" + value.getHexString();

  return (
    <ColorInputContainer>
    { /* @ts-ignore */ }
      <Popover
        disabled={disabled}
        renderContent={() => (
          <ColorInputPopover>
            <SketchPicker {...rest} color={hexColor} disableAlpha={true} onChange={onChangePicker} />
          </ColorInputPopover>
        )}
      >
        <StyledColorInput as="div" disabled={disabled}>
          <ColorPreview style={{ background: hexColor }} />
          <ColorText>{hexColor.toUpperCase()}</ColorText>
        </StyledColorInput>
      </Popover>
    </ColorInputContainer>
  );
}

ColorInput.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func
};

ColorInput.defaultProps = {
  value: new Color(),
  onChange: () => {}
};
