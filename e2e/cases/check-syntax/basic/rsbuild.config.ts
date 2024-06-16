import path from 'node:path';
import { pluginCheckSyntax } from '@rsbuild/plugin-check-syntax';

export default {
  plugins: [
    pluginCheckSyntax({
      enable: true,
    }),
  ],
  dev: {
    writeToDisk: true,
  },
  source: {
    exclude: [path.resolve(__dirname, './src/test.js')],
  },
  output: {
    sourceMap: {
      js: 'source-map',
    },
    overrideBrowserslist: ['ie 11'],
  },
};
