import React, { Component } from "react";
import { Button } from "./Button";
import Hidden from "../layout/Hidden";
let nextId = 0;
type FileInputProps = {
  accept: any;
  label: string;
  onChange: (...args: any[]) => any;
};
type FileInputState = {
  id: string;
};
export default class FileInput extends Component<
  FileInputProps,
  FileInputState
> {
  constructor(props) {
    super(props);
    this.state = {
      id: `file-input-${nextId++}`
    };
  }
  onChange = e => {
    this.props.onChange(e.target.files, e);
  };
  render() {
    const { label, onChange, ...rest } = this.props as any;
    return (
      <div>
        <Button as="label" htmlFor={this.state.id}>
          {label}
        </Button>
        <Hidden
          as="input"
          {...rest}
          id={this.state.id}
          type="file"
          onChange={this.onChange}
        />
      </div>
    );
  }
}
