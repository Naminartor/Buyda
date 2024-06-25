module.exports = {
    // Other ESLint configuration options...

    files: ['**/*.js', "../types.js", "**/*.html"],
    ignores: ["./mock-api.js"],

    // Other ESLint configuration options...
    languageOptions: {
        globals:{
            "api": "readonly",
        }
    },
    "plugins": [
        "eslint-plugin-html",
    ],
};