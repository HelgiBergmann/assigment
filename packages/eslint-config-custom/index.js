module.exports = {
  extends: ["turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
  },
  parserOptions: {
    ecmaVersion: "latest",
  },

  env: {
    es6: true,
  },
};
