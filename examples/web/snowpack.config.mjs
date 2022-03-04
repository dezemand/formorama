/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  workspaceRoot: "../../",
  mount: {
    src: "/"
  },
  plugins: [
    "@snowpack/plugin-babel"
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
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
    /* ... */
  },
  buildOptions: {
    /* ... */
  }
};
