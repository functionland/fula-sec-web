import { build } from "esbuild";
import typeGen from 'npm-dts';
const { Generator } = typeGen;

const buildConfig = {
  entryPoints: ['src/index.ts'],
  target: ['es2020', 'chrome58', 'firefox60'], // Browser compatibility targets
  bundle: true,
  sourcemap: true,
  // Consider adding plugins here (e.g., node-replace, react)
};

// esm
build({
  ...buildConfig,
  format: 'esm',
  outfile: 'lib/esm/index.js',
}).catch(()=>process.exit(1))

// commonjs
build({
  ...buildConfig,
  format: 'cjs',
  outfile: 'lib/cjs/index.js',
}).catch(()=>process.exit(1))

//type
new Generator({
  entry: 'src/index.ts',
  output: 'lib/esm/index.d.ts',
}).generate()
