import React, { Component } from 'react';
import PropTypes from 'prop-types';
import whatkey, { unprintableKeys } from 'whatkey';
import {
  ContainerMain, ContainerContent, Holder,
  Input, InputArea, MainInput,
  OutputLine, PreOutputLine, Prompt,
} from './styled-elements';

class Content extends Component<any> {
  static displayName = 'Content';

  static propTypes = {
    id: PropTypes.string,
    oldData: PropTypes.object, // eslint-disable-line
    prompt: PropTypes.string,
    register: PropTypes.func,
    handleChange: PropTypes.func,
    handlerKeyPress: PropTypes.func.isRequired,
  };

  static defaultProps = {
    prompt: '>',
    oldData: {},
  };

  static contextTypes = {
    maximise: PropTypes.bool,
    instances: PropTypes.array,
    activeTab: PropTypes.string,
    tabsShowing: PropTypes.bool,
  };

  state = {
    summary: [],
    promptPrefix: '',
    prompt: '>',
    history: [],
    historyCounter: 0,
    input: [],
    keyInputs: [],
    canScroll: true,
    controller: null,
  };

  componentWillMount = () => {
    const data = this.context.instances.find(i => i.index === this.props.id);
    let state = { prompt: this.props.prompt };
    if (data) {
      state = { ...state, ...data.oldData };
    }
    this.setState(state);
  };

  componentDidMount = () => {
    this.focusInput();
    const data = this.context.instances.find(i => i.index === this.props.id);
    this.unregister = this.props.register(this);
    if (!data || Object.keys(data.oldData).length === 0) {
      this.handleChange({ target: { value: 'show' }, key: 'Enter', dontShowCommand: true });
    }
  };

  // Adjust scrolling
  componentDidUpdate = () => {
    if (this.inputWrapper !== null) {
      this.inputWrapper.scrollIntoView(false);
    }
  };
  unregister: any = null;
  inputWrapper: any = null;
  contentWrapper: any = null;
  com: any = null

  componentWillUnmount() {
    this.unregister(this.state);
  }

  setScrollPosition = (pos) => {
    setTimeout(() => {
      if (this.contentWrapper !== null) {
        this.contentWrapper.scrollTop = pos;
      }
    }, 50);
  };

  focusInput = () => {
    if (this.com !== null) {
      this.com.focus();
    }
  };

  handleChange = (e) => {
    this.props.handleChange(this, e);
  }

  handleKeyPress = (e) => {
    this.props.handlerKeyPress(this, e, this.com);
    const { key } = whatkey(e);
    if (key == 'enter')
      this.setScrollPosition(this.contentWrapper.scrollHeight);
  }

  handleOuterKeypress = (e) => {
    const { key } = whatkey(e);
    const actionKeys = ['up', 'down', 'left', 'right', 'enter'];
    if (unprintableKeys.indexOf(key) < 0) {
      if (this.com != null && document.activeElement !== this.com) {
        this.com.focus();
        this.com.value += whatkey(e).char;
      }
    } else if (actionKeys.indexOf(key) > -1) {
      this.com?.focus();
    }
  }

  render() {
    const { id } = this.props;
    const {
      maximise, activeTab, tabsShowing,
    } = this.context;

    if (id !== activeTab) {
      return null;
    }

    const output = this.state.summary.map((content, i) => {
      if (typeof content === 'string' && content.length === 0) {
        return <OutputLine key={i} > &nbsp; </OutputLine>;
      }
      return (
        <PreOutputLine key={i} >
          {
            Array.isArray(content) ?
            content.map((cont, key) => (
              <span style={{ marginRight: 5 }} key={`inner-${key}`}>{cont}</span>
            )) :
            content
          }
        </PreOutputLine>
      );
    });

    let toSubtract = 0;
    if (tabsShowing) {
      toSubtract += 30;
    }

    return (
      <ContainerMain
        style={{
          ...(maximise
            ? { maxWidth: '100%', maxHeight: `calc(100% - ${toSubtract}px)` }
            : {}),
          ...(this.state.canScroll
            ? { overflowY: 'auto' }
            : { overflowY: 'hidden' }),
        }}
        tabIndex="0"
        onKeyUp={this.handleOuterKeypress}
//      innerRef={(ctw) => { this.contentWrapper = ctw; }}
        ref={(ctw) => { this.contentWrapper = ctw; }}
      >
        <Holder>
          <ContainerContent>
            <InputArea>
              {output}
              <Input
                innerRef={(elm) => { this.inputWrapper = elm; }}
              >
                <Prompt>
                  {this.state.promptPrefix + this.state.prompt}
                </Prompt>
                <MainInput
                  autoFocus={true}
                  onBlur={({ target }) => target.focus()}
                  type="text"
                  tabIndex="-1"
//                innerRef={(com) => { console.log(com); this.com = com; }}
                  ref={(com) => { console.log(com); this.com = com; }}
                  onKeyPress={this.handleChange}
                  onKeyDown={this.handleKeyPress}
                />
              </Input>
            </InputArea>
          </ContainerContent>
        </Holder>
      </ContainerMain>
    );
  }
}

export default Content;
