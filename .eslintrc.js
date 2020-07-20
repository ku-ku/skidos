module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "app": true,
        "$": true,
        "jQuery": true,
        "process": true,
        "$utils": true,
        "$http": true
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
        'no-console': 'off',
        'no-debugger': 'off',
        'no-extra-boolean-cast': 'off',
        'no-useless-escape': 'off',
        'operator-linebreak': 'off',
        'comma-dangle': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'vue/no-v-html': 'off',
        'vue/no-unused-components': 'off'
    }
};