import { createStore, applyMiddleware } from "redux";
import authReducer from "./authReducer";
import logger from "redux-logger";
import thunk from "redux-thunk";

const configureStore = (addLoger = true) => {
  let localStorageData = localStorage.getItem("hoax-auth");

  let persistedState = {
    id: 0,
    username: "",
    displayName: "",
    image: "",
    password: "",
    isLoggedIn: false,
  };

  if (localStorageData) {
    try {
      persistedState = JSON.parse(localStorageData);
    } catch (error) {}
  }

  const middleware = addLoger
    ? applyMiddleware(thunk, logger)
    : applyMiddleware(thunk);
  const store = createStore(authReducer, persistedState, middleware);

  store.subscribe(() => {
    localStorage.setItem("hoax-auth", JSON.stringify(store.getState()));
  });

  return store;
};

export default configureStore;
