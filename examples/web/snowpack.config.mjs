/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  workspaceRoot: "../../",
  mount: {
    src: "/"
  },
  plugins: [
    "@snowpack/plugin-babel",
    "@snowpack/plugin-sass"
  ],
  routes: [
    {match: "routes", src: ".*", dest: "/index.html"}
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    knownEntrypoints: [
      "react/jsx-runtime",
      "events"
    ]
  },
  devOptions: {
    open: "none"
  },
  buildOptions: {
    baseUrl: "/"
  }
};
