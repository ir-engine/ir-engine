import PropTypes from 'prop-types';
import { commands, descriptions } from '../commands';

export const commandsPropType = PropTypes.objectOf(PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({
    options: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      defaultValue: PropTypes.any,
    })),
    method: PropTypes.func,
  }),
]));

export const descriptionsPropType = PropTypes.objectOf(PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.bool,
]));

export const TerminalPropTypes = {
  startState: PropTypes.oneOf(['minimised', 'maximised', 'open', 'closed']),
  showActions: PropTypes.bool,
  allowTabs: PropTypes.bool,
  msg: PropTypes.string,
  closedTitle: PropTypes.string,
  closedMessage: PropTypes.string,
  color: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line
  prompt: PropTypes.string,
  outputColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  commands: commandsPropType,
  descriptions: descriptionsPropType,
  watchConsoleLogging: PropTypes.bool,
  commandPassThrough: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool,
  ]),
  promptSymbol: PropTypes.string,
  plugins: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      class: PropTypes.func,
      config: PropTypes.object,
    }),
  ])),
  shortcuts: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
  actionHandlers: PropTypes.shape({
    handleClose: PropTypes.func,
    handleMinimise: PropTypes.func,
    handleMaximise: PropTypes.func,
  }),
  afterChange: PropTypes.func,
  commandWasRun: PropTypes.func,
};

export const TerminalContextTypes = {
  tabsShowing: PropTypes.bool,
  activeTabId: PropTypes.string,
  instances: PropTypes.array,
  show: PropTypes.bool,
  minimise: PropTypes.bool,
  maximise: PropTypes.bool,
  closeWindow: PropTypes.func,
  openWindow: PropTypes.func,
  minimiseWindow: PropTypes.func,
  unminimiseWindow: PropTypes.func,
  maximiseWindow: PropTypes.func,
  unmaximiseWindow: PropTypes.func,
  toggleShow: PropTypes.func,
  toggleMaximise: PropTypes.func,
  toggleMinimize: PropTypes.func,
};

export const TerminalDefaultProps = {
  startState: 'closed',
  allowTabs: true,
  showActions: true,
  msg: 'Interactive terminal. For commands list execute help.',
  closedTitle: 'OOPS! You closed the window.',
  closedMessage: 'Click on the icon to reopen.',
  color: 'green',
  style: {
    fontWeight: "bold",
    fontSize: "1em",
    position: "fixed",
    bottom: "0",
    width: "100%",
    // Height is set in termimal itself depending is it expanded.
    // height: "30%",
    zIndex: 4000 },
    prompt: 'green',
  backgroundColor: 'black',
  commands: commands,
  descriptions: descriptions,
  watchConsoleLogging: false,
  commandPassThrough: false,
  promptSymbol: '>',
  plugins: [],
  shortcuts: {},
};

        