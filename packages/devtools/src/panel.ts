import Panel from './components/Panel';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(<Panel />, document.getElementById('app'));

var globalBrowser =  typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

if (globalBrowser && globalBrowser.devtools) {
  var backgroundPageConnection = globalBrowser.runtime.connect({
    name: "devtools"
  });
}
