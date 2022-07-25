import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./containers/App";
import { Provider } from "react-redux";
import configureStore from "./redux/configureStore";

const store = configureStore();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// const actions = {
//   postLogin: apiCalls.login,
//   //postSignup: apiCalls.signup
// };
