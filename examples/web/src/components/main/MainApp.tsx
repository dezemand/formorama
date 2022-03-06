import { VFC } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { examples } from "../../examples";
import { Heading } from "../atoms/heading/Heading";
import { Main } from "../atoms/main/Main";
import { Header } from "../header/Header";

export const MainApp: VFC = () => {
  return (
    <BrowserRouter>
      <Header />
      <Main>
        <Routes>
          <Route path="/" element={<Heading>Test</Heading>} />
          {Object.entries(examples).map(([id, { component: Component }]) => (
            <Route key={id} path={`/${id}`} element={<Component />} />
          ))}
          <Route path="*" element={<Heading>Not found</Heading>} />
        </Routes>
      </Main>
    </BrowserRouter>
  );
};
