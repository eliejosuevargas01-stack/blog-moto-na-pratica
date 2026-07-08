import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Reviews from "./pages/Reviews";
import Manutencao from "./pages/Manutencao";
import Rotas from "./pages/Rotas";
import Equipamentos from "./pages/Equipamentos";
import Sobre from "./pages/Sobre";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "post/:slug", Component: Post },
      { path: "reviews", Component: Reviews },
      { path: "manutencao", Component: Manutencao },
      { path: "rotas", Component: Rotas },
      { path: "equipamentos", Component: Equipamentos },
      { path: "sobre", Component: Sobre },
    ],
  },
]);
