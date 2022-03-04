import { FC } from "react";
import ReactDOM from "react-dom";
import "./index.css";

const container = document.getElementById("root");

const App: FC = () => {
  return <h1>Todo</h1>;
};

ReactDOM.render(<App />, container);
