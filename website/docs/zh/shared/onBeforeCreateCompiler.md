`onBeforeCreateCompiler` 是在创建底层 Compiler 实例前触发的回调函数，当你执行 `rsbuild.startDevServer`、`rsbuild.build` 或 `rsbuild.createCompiler` 时，都会调用此钩子。

你可以通过 `bundlerConfigs` 参数获取到 Rspack 配置数组，数组中可能包含一份或多份 [Rspack 配置](https://rspack.dev/config.html)，这取决于 Rsbuild [output.targets](/config/output/targets) 配置的值。

- **类型：**

```ts
function OnBeforeCreateCompiler(
  callback: (params: {
    bundlerConfigs: WebpackConfig[] | RspackConfig[];
  }) => Promise<void> | void,
): void;
```