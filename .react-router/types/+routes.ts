// Generated by React Router

import "react-router"

declare module "react-router" {
  interface Register {
    pages: Pages
    routeFiles: RouteFiles
  }
}

type Pages = {
  "/": {
    params: {};
  };
  "/dashboard": {
    params: {};
  };
  "/*": {
    params: {
      "*": string;
    };
  };
};

type RouteFiles = {
  "root.tsx": {
    id: "root";
    page: "/" | "/dashboard" | "/*";
  };
  "./routes/login.tsx": {
    id: "routes/login";
    page: "/";
  };
  "./routes/dashboard.tsx": {
    id: "routes/dashboard";
    page: "/dashboard";
  };
  "./routes/404.tsx": {
    id: "routes/404";
    page: "/*";
  };
};