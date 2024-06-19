import type { RsbuildConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';

export type PluginPreactOptions = {
  /**
   * Whether to aliases `react`, `react-dom` to `preact/compat`
   * @default true
   */
  reactAliasesEnabled?: boolean;
};

export const PLUGIN_PREACT_NAME = 'rsbuild:preact';

export const pluginPreact = (
  options: PluginPreactOptions = {},
): RsbuildPlugin => ({
  name: PLUGIN_PREACT_NAME,

  setup(api) {
    const { reactAliasesEnabled = true } = options;

    api.modifyRsbuildConfig((userConfig, { mergeRsbuildConfig }) => {
      const reactOptions: Rspack.SwcLoaderTransformConfig['react'] = {
        development: process.env.NODE_ENV === 'development',
        runtime: 'automatic',
        importSource: 'preact',
      };

      const extraConfig: RsbuildConfig = {
        tools: {
          swc: {
            jsc: {
              parser: {
                syntax: 'typescript',
                // enable supports for JSX/TSX compilation
                tsx: true,
              },
              transform: {
                react: reactOptions,
              },
            },
          },
        },
      };

      if (reactAliasesEnabled) {
        extraConfig.source ||= {};
        extraConfig.source.alias = {
          react: 'preact/compat',
          'react-dom/test-utils': 'preact/test-utils',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
        };
      }

      return mergeRsbuildConfig(extraConfig, userConfig);
    });
  },
});
