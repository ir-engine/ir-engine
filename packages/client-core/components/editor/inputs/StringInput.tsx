// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Input from "./Input";

const StyledStringInput = (styled as any)(Input)`
  display: flex;
  width: 100%;
`;

const StringInput = React.forwardRef(({ onChange, ...rest }, ref) => (
  <StyledStringInput onChange={e => onChange(e.target.value, e)} {...rest} ref={ref} />
));

StringInput.displayName = "StringInput";

StringInput.defaultProps = {
  value: "",
  onChange: () => {},
  type: "text",
  required: false
};

StringInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func
};

export default StringInput;

const DropContainer = (styled as any).div`
  display: flex;
  width: 100%;
`;

export const ControlledStringInput = React.forwardRef((values, ref) => {
  const { onChange, value, ...rest } = values as any;
  const inputRef = useRef();

  const [tempValue, setTempValue] = useState(value);

  const onKeyUp = useCallback(e => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current.blur();
    }
  }, []);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const onBlur = useCallback(() => {
    onChange(tempValue);
  }, [onChange, tempValue]);

  const onChangeValue = useCallback(
    e => {
      setTempValue(e.target.value);
    },
    [setTempValue]
  );

  return (
    <DropContainer ref={ref}>
      <StyledStringInput
        ref={inputRef}
        onChange={onChangeValue}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        value={tempValue}
        {...rest}
      />
    </DropContainer>
  );
});

ControlledStringInput.displayName = "ControlledStringInput";

ControlledStringInput.defaultProps = {
  value: "",
  onChange: () => {},
  type: "text",
  required: false
};

ControlledStringInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func
};
