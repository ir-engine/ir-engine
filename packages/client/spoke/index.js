import ReactDOM from "react-dom";
import React from "react";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import App from "./ui/App";
import Api from "./api/Api";

const api = new Api();

ReactDOM.render(<App api={api} />, document.getElementById("app"));
