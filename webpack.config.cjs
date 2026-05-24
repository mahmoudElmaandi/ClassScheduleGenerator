const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
const [isOptimized, isObfuscated] = [true, true];
const optimization = isOptimized ? {
    usedExports: true,
    sideEffects: true,
    minimize: true,
    minimizer: [new TerserPlugin({
        extractComments: false,
        terserOptions: {
            compress:
            {
                drop_console: true
            }
        }
    })]
} : {};
const obfuscator = isObfuscated ?
    [new JavaScriptObfuscator({
        rotateStringArray: true,
        compact: true
    })] : [];
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    // mode: 'development',
    optimization,
    plugins: [
        ...obfuscator
    ],
    watch: true,
};