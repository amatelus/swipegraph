import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import replace from 'rollup-plugin-replace';
const fs = require('fs');

export default [{
  input: "src/index.js",
  output: {
    name: "swipegraph",
    format: "iife",
    file: "dist/swipegraph.min.js",
    sourcemap: true,
  },
  plugins: [replace({
    "process.env.VERSION": JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).version),
  }), babel(), uglify()]
},{
  input: "src/index.js",
  output: {
    name: "swipegraph",
    format: "iife",
    file: "dist/swipegraph.js",
  },
  plugins: [replace({
    "process.env.VERSION": JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).version),
  }), babel()]
}]