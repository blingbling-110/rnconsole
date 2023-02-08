import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: 'json' };

export default {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies),
    output: {
        file: pkg.main,
        format: 'es',
        sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            declaration: true,
            declarationDir: './types'
        }),
        terser()
    ]
};