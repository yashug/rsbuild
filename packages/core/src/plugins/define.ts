import { getPublicPathFromChain, removeTailingSlash } from '../helpers';
import type { Define, RsbuildPlugin } from '../types';

export const pluginDefine = (): RsbuildPlugin => ({
  name: 'rsbuild:define',

  setup(api) {
    api.modifyBundlerChain((chain, { CHAIN_ID, bundler, environment }) => {
      const { config } = environment;
      const builtinVars: Define = {
        'import.meta.env.MODE': JSON.stringify(config.mode),
        'import.meta.env.DEV': config.mode === 'development',
        'import.meta.env.PROD': config.mode === 'production',
        'process.env.ASSET_PREFIX': JSON.stringify(
          getPublicPathFromChain(chain, false),
        ),
        'process.env.PUBLIC_BASE_PATH': JSON.stringify(
          removeTailingSlash(config.server.base),
        ),
      };

      chain
        .plugin(CHAIN_ID.PLUGIN.DEFINE)
        .use(bundler.DefinePlugin, [
          { ...builtinVars, ...config.source.define },
        ]);
    });
  },
});
