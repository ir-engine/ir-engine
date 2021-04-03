import styled from 'styled-components';

export const Container = (styled as any).div`
 display: block;
 margin: 0 auto;
`;

export const ContainerMain = (styled as any).div`
display: block;
margin: 0 auto;
  max-width: 100%;
  transition: all 0.4s ease-out;
  background: ${props => props.theme.backgroundColor};
  height: 100%;
  overflow: scroll;
  position: relative;

  &:focus {
    outline: none;
  }
`;

export const OutputLine = (styled as any).div`
  font-family: 'Inconsolata', monospace;
  font-size: 0.9em;
  color: ${props => (props.theme.outputColor || props.theme.color)};
  margin-top: 10px;
  margin-bottom: 10px;
  white-space: pre-wrap;
`;
export const PreOutputLine = (styled as any).pre`
  font-family: 'Inconsolata', monospace;
  font-size: 0.9em;
  color: ${props => (props.theme.outputColor || props.theme.color)};
  margin-top: 10px;
  margin-bottom: 10px;
  white-space: pre-wrap;
`;

export const Input = (styled as any).div`
  display: flex;
  align-items: center;
  padding-top: 15px;
  padding-bottom: 15px;
`;

export const Prompt = (styled as any).span`
  color: ${props => props.theme.prompt};
`;

export const MainInput = (styled as any).input`
  font: inherit;
  font-size: 0.9em;
  &, &:focus{
    border: none;
    padding: 0;
    margin: 3px;
    background: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.color};
    flex: 1;
    outline: none;
   }
`;

export const Holder = (styled as any).div`
`;

export const ContainerContent = (styled as any).div`
  padding: 5px 20px;
  height: 100%;
`;

export const InputArea = (styled as any).div`
  height: 100%;
  padding: 3px;
`;
