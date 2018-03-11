import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import replace from 'rollup-plugin-replace';

const fs = require('fs');
const env = replace({
  "process.env.VERSION": JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).version),
});

export default [{
  input: "src/index.js",
  output: {
    name: "swipegraph",
    format: "umd",
    file: "dist/swipegraph.min.js",
    sourcemap: true,
  },
  plugins: [env, babel(), uglify()]
}, {
  input: "src/index.js",
  output: {
    name: "swipegraph",
    format: "umd",
    file: "dist/swipegraph.js",
  },
  plugins: [env, babel()]
}]
