import React from 'react';
import newId from '../utils/newId';

export default class Checkbox extends React.PureComponent {
  id: string;
  componentDidMount() {
    this.id = newId();
  }

  render() {
    return (
      <label htmlFor={this.id}>
        <input
          type="checkbox"
          id={this.id}
          {...this.props}>
        </input>
      {(this.props as any).description}</label>
    );
  }
}
