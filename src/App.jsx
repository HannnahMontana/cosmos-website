import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./context/UserContext.jsx";

import HomePage from "./pages/Home.jsx";
import AboutPage from "./pages/About.jsx";
import RootLayout from "./pages/Root.jsx";
import ArticlePage from "./pages/Article.jsx";
import AuthPage from "./pages/Auth.jsx";
import AddNewArticle from "./pages/AddNewArticle.jsx";

import { action as authAction } from "./pages/Auth";
import { checkAuthLoader, tokenLoader } from "./util/auth";
import { action as logoutAction } from "./pages/Logout";

import { queryClient } from "./util/http";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
// import NotAuthorized from "./pages/NotAuthorized.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    loader: tokenLoader,
    id: "root",
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      {
        path: "articles",
        children: [
          {
            index: true,
            element: <Navigate to="/#section-articles" />,
          },
          {
            path: ":articleId",
            id: "article",
            children: [
              {
                index: true,
                element: <ArticlePage />,
              },
            ],
          },
          {
            path: "new",
            element: (
              <ProtectedRoute>
                <AddNewArticle />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // { path: "not-authorized", element: <NotAuthorized /> },
      { path: "auth", element: <AuthPage />, action: authAction },
      { path: "logout", action: logoutAction },
    ],
  },
]);

function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
