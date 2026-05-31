import generatePackageJson from 'rollup-plugin-generate-package-json';
import postcss from 'rollup-plugin-postcss';
import { string } from 'rollup-plugin-string';
import ts from 'rollup-plugin-ts';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.module.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['three', '@photo-sphere-viewer/core'],
  plugins: [
    ts(),
    postcss({
      extract: 'index.css',
      sourceMap: true,
      use: ['sass'],
    }),
    string({
      include: ['**/*.svg'],
    }),
    generatePackageJson({
      baseContents: (pkg) => {
        pkg = {
          ...pkg,
          main: 'index.cjs',
          module: 'index.module.js',
          types: 'index.d.ts',
          style: 'index.css',
        };
        delete pkg.scripts;
        delete pkg.devDependencies;
        return pkg;
      },
      // 仅此演示需要，用于覆盖 "file" 依赖
      additionalDependencies: {
        '@photo-sphere-viewer/core': '^5.0.0',
      },
    }),
  ],
};
