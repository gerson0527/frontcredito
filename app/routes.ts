import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "./routes/login.tsx"),
  route("/dashboard", "./routes/dashboard.tsx"),
  route("*", "./routes/404.tsx"),
] satisfies RouteConfig;