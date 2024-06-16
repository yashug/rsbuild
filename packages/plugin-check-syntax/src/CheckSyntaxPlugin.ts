import type { Rspack } from '@rsbuild/core';
import { JS_REGEX, browserslistToESVersion } from '@rsbuild/shared';
import { parse } from 'acorn';
import {
  checkIsExcludeSource,
  generateError,
  getHtmlScripts,
  printErrors,
} from './helpers';
import type {
  AcornParseError,
  CheckSyntaxExclude,
  CheckSyntaxOptions,
  ECMASyntaxError,
  EcmaVersion,
} from './types';

const HTML_REGEX = /\.html$/;

export class CheckSyntaxPlugin {
  errors: ECMASyntaxError[] = [];

  ecmaVersion: EcmaVersion;

  targets: string[];

  rootPath: string;

  exclude: CheckSyntaxExclude | undefined;

  constructor(
    options: CheckSyntaxOptions &
      Required<Pick<CheckSyntaxOptions, 'targets'>> & {
        rootPath: string;
      },
  ) {
    this.targets = options.targets;
    this.exclude = options.exclude;
    this.rootPath = options.rootPath;
    this.ecmaVersion =
      options.ecmaVersion || browserslistToESVersion(this.targets);
  }

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(CheckSyntaxPlugin.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: CheckSyntaxPlugin.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
          // @ts-expect-error
          additionalAssets: true,
        },
        async (assets) => {
          const files = Object.keys(assets).filter(
            (assets) => HTML_REGEX.test(assets) || JS_REGEX.test(assets),
          );
          console.log('files', files);
          await Promise.all(
            files.map(async (file) => {
              const asset = compilation.getAsset(file);
              if (!asset) {
                return;
              }

              await this.check(file, asset.source.source());
            }),
          );

          printErrors(this.errors, this.ecmaVersion);
        },
      );
    });
  }

  private async check(filepath: string, content: string) {
    if (HTML_REGEX.test(filepath)) {
      const htmlScripts = getHtmlScripts(content);
      await Promise.all(
        htmlScripts.map(async (script) => {
          if (!checkIsExcludeSource(filepath, this.exclude)) {
            await this.tryParse(filepath, script);
          }
        }),
      );
    }

    if (JS_REGEX.test(filepath)) {
      await this.tryParse(filepath, content);
    }
  }

  private async tryParse(filepath: string, code: string) {
    try {
      parse(code, { ecmaVersion: this.ecmaVersion });
    } catch (_: unknown) {
      const err = _ as AcornParseError;

      const error = await generateError({
        err,
        code,
        filepath,
        exclude: this.exclude,
        rootPath: this.rootPath,
      });

      if (error) {
        this.errors.push(error);
      }
    }
  }
}
