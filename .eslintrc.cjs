module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  env: {
    browser: true,
    amd: true,
    node: true
  },
  rules: {
    "no-console": ["warn"],
    "no-constant-condition": ["warn"],
    "no-unreachable": ["warn"],
    "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }]
  }
};
