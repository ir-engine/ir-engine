import styled from "styled-components";

function getFlex(props) {
  if (props.flex == null) {
    return 0;
  } else if (typeof props.flex !== "number") {
    return 1;
  }

  return props.flex;
}

function cssNumberProp(value) {
  return typeof value === "number" ? value + "px" : typeof value === "string" ? value : "auto";
}

export const Column = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: ${getFlex};
  height: ${props => cssNumberProp(props.height)};
  width: ${props => cssNumberProp(props.width)};
`;

export const Row = (styled as any).div`
  display: flex;
  flex: ${getFlex};
  height: ${props => cssNumberProp(props.height)};
  width: ${props => cssNumberProp(props.width)};
`;

export const VerticalScrollContainer = (styled as any)(Column)`
  overflow-y: auto;
  min-height: 0;
`;

export const HorizontalScrollContainer = (styled as any)(Row)`
  overflow-x: auto;
`;
