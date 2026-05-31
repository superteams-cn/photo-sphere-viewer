# 开发

全景图查看器 使用 [TypeScript](https://www.typescriptlang.org/) 和 [SASS](https://sass-lang.com/) 开发。
本仓库是一个 [Turborepo](https://turbo.build/repo) monorepo，包含核心包以及官方适配器和插件。
构建流程基于 [tsup](https://tsup.egoist.dev/)（基于 esbuild 的工具包），并包含一系列自定义配置。
文档使用 [VitePress](https://vitepress.dev/) 和 [TypeDoc](https://typedoc.org/) 生成。
文件使用 [ESLint](https://eslint.org/) 和 [Stylelint](https://stylelint.io/) 进行 lint。
测试使用 [Mocha](https://mochajs.org/) 和 [Cypress](https://www.cypress.io/) 执行。
你需要安装 [Node.js 24](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。

## 命令

- 使用 `pnpm serve` 启动开发服务器
  - 使用 `pnpm serve-filter` 只监听部分包
- 使用 `pnpm doc:serve` 启动文档
- 使用 `pnpm e2e:open` 启动 Cypress runner
- 使用 `pnpm npm-link` 为 npm link 注册所有包
- 使用 `pnpm lint` 执行 linters
- 使用 `pnpm test` 执行单元测试
- 使用 `pnpm e2e:run` 执行 e2e 测试
- 使用 `pnpm build` 构建所有包
- 使用 `pnpm doc:build` 构建文档

## 致谢

以下是各个演示中使用的照片和视频来源：

- sphere、sphere-tiles、cubemap、cubemap-tiles：[Damien Sorel（我本人）](https://galerie.strangeplanet.fr/picture.php?/1802/category/81)
- sphere-tiles-24k, cubemap-tiles-24k: [Greg Zaal](https://polyhaven.com/a/cannon)
- artist-workshop: [Oliksiy Yakovlyev](https://polyhaven.com/a/artist_workshop)
- equirectangular-video: [Mettle Communications](https://www.mettle.com/360vr-master-series-free-360-downloads-page)
- cubemap-video: [The Dalí Museum](https://www.youtube.com/watch?v=zQ2-oJOkTKc)
- tour：Pixexid（链接已失效）
- dualfisheye: [Jonna Luostari](https://jonnaluostari.com)
