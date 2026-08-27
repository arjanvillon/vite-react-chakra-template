import { ValidateEnv } from '@julr/vite-plugin-validate-env';
import babel from '@rolldown/plugin-babel';
import { devtools as tanstackDevtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
import type { PluginOption } from 'vite-plus';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isCheckDisabled = mode === 'production' || !!process.env.VITEST;
  const env = loadEnv(mode, process.cwd(), '');
  const isReactCompilerEnabled = env.ENABLE_PLUGIN_REACT_COMPILER === 'true';

  return {
    fmt: {
      // disable vp fmt
      ignorePatterns: ['**/*'],
      singleQuote: true,
    },
    lint: {
      // disable vp check
      ignorePatterns: ['**/*'],
      options: { typeAware: true, typeCheck: true },
    },
    plugins: lazyPlugins(() => [
      tanstackDevtools(),
      ValidateEnv(),
      tanstackStart({
        prerender: {
          enabled: true,
          failOnError: true,
        },
        spa: {
          enabled: false,
        },
      }),
      react(),
      ...(isReactCompilerEnabled
        ? [
            babel({
              presets: [reactCompilerPreset()],
            }),
          ]
        : []),
      ...(isCheckDisabled
        ? []
        : [
            checker({
              typescript: true,
            }),
          ]),
      visualizer({ template: 'sunburst' }) as unknown as PluginOption,
    ]),
    resolve: {
      tsconfigPaths: true,
    },
    staged: {
      '*.{ts,js,json,md}': ['ultracite fix'],
      'src/**/*.{js,jsx,ts,tsx,json,css,scss,md}': ['ultracite fix'],
    },
    test: {
      coverage: {
        include: ['src/lib/utils/**/**.{ts,tsx,js,jsx}'],
      },
    },
  };
});
