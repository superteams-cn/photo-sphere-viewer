import { startCase, capitalize } from 'lodash-es';
import fs from 'node:fs';
import { resolve } from 'node:path';
import path from 'node:path';
import { defineConfig } from 'vitepress';

import codeDemo from './plugins/code-demo/extendMarkdown';
import dialog from './plugins/dialog/extendMarkdown';
import gallery from './plugins/gallery/extendMarkdown';
import module from './plugins/module/extendMarkdown';
import tabs from './plugins/tabs/extendMarkdown';

function posixJoin(...args) {
  return path
    .join(...args)
    .split(path.sep)
    .join(path.posix.sep); // Windows compat...
}

function listFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = posixJoin(dir, dirent.name);
    return dirent.isDirectory() ? listFiles(res) : res;
  });
  return files.flat();
}

function getFiles(dir) {
  const absoluteDir = posixJoin(__dirname, '..', dir);
  return listFiles(absoluteDir).map((f) => f.substr(absoluteDir.length + 1));
}

const externals = {
  three: 'https://cdn.jsdelivr.net/npm/three/build/three.module.min.js',
  marked: 'https://cdn.jsdelivr.net/npm/marked@14/lib/marked.esm.min.js',
  '@photo-sphere-viewer/core': 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.module.min.js',
  '@photo-sphere-viewer/equirectangular-tiles-adapter':
    'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/equirectangular-tiles-adapter@5/index.module.min.js',
};

const importmap = `<script type="importmap">${JSON.stringify({ imports: externals })}</script>`;

const adapters = [
  { text: '等距柱状图', link: '/equirectangular' },
  { text: '等距柱状瓦片', link: '/equirectangular-tiles' },
  { text: '等距柱状视频', link: '/equirectangular-video' },
  { text: '立方体贴图', link: '/cubemap' },
  { text: '立方体瓦片', link: '/cubemap-tiles' },
  { text: '立方体视频', link: '/cubemap-video' },
  { text: '双鱼眼', link: '/dual-fisheye' },
];

const pluginNames: Record<string, string> = {
  'autorotate.md': '自动旋转',
  'compass.md': '指南针',
  'gallery.md': '图库',
  'gyroscope.md': '陀螺仪',
  'map.md': '地图',
  'markers.md': '标记',
  'overlays.md': '覆盖层',
  'plan.md': '平面图',
  'resolution.md': '分辨率',
  'settings.md': '设置',
  'stereo.md': '立体视图',
  'video.md': '视频',
  'virtual-tour.md': '虚拟导览',
  'visible-range.md': '可视范围',
};

const demoGroups: Record<string, string> = {
  advanced: '进阶',
  basic: '基础',
  compass: '指南针',
  map: '地图',
  markers: '标记',
  overlays: '覆盖层',
  plan: '平面图',
};

const demoNames: Record<string, string> = {
  '0-config.md': '零配置',
  'animation.md': '动画',
  'chroma-key.md': '色键抠像',
  'cropped-panorama.md': '裁剪全景图',
  'custom-element.md': '自定义元素',
  'custom-marker.md': '自定义标记',
  'custom-navbar.md': '自定义导航栏',
  'custom-tooltip.md': '自定义提示框',
  'description.md': '说明内容',
  'double-click-zoom.md': '双击缩放',
  'fisheye.md': '鱼眼效果',
  'hover-scale.md': '悬停缩放',
  'keyboard-actions.md': '键盘操作',
  'layers.md': '图层',
  'markers.md': '标记',
  'navbar-element.md': '导航栏元素',
  'partial-overlay.md': '局部覆盖层',
  'polygon-pattern.md': '多边形纹理',
  'screenshot.md': '截图',
  'transition.md': '切换过渡',
  'youtube-element.md': 'YouTube 元素',
};

export default defineConfig({
  lang: 'zh-CN',
  outDir: '../public',
  title: 'Photo Sphere Viewer',
  description: '用于展示 360° 全景图的 JavaScript 库',
  ignoreDeadLinks: [(url) => url.startsWith('/api/')],

  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5/index.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7/css/materialdesignicons.min.css' }],
  ],

  themeConfig: {
    logo: '/favicon.png',
    aside: true,
    outline: {
      label: '本页目录',
      level: 'deep',
    },
    externalLinkIcon: true,
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    skipToContentLabel: '跳到内容',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    editLink: {
      pattern: 'https://github.com/mistic100/Photo-Sphere-Viewer/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    footer: {
      copyright: '代码基于 MIT 协议，文档基于 CC BY 3.0 协议',
    },
    search: {
      provider: 'algolia',
      options: {
        appId: '5AVMW192FM',
        apiKey: 'd443b6c08ed5353575f503b7a57f5bbf',
        indexName: 'photo-sphere-viewer',
        placeholder: '搜索文档',
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            searchBox: {
              resetButtonTitle: '清除搜索条件',
              resetButtonAriaLabel: '清除搜索条件',
              cancelButtonText: '取消',
              cancelButtonAriaLabel: '取消',
            },
            startScreen: {
              recentSearchesTitle: '最近搜索',
              noRecentSearchesText: '暂无最近搜索',
              saveRecentSearchButtonTitle: '保存这条搜索',
              removeRecentSearchButtonTitle: '从历史记录中删除这条搜索',
              favoriteSearchesTitle: '收藏搜索',
              removeFavoriteSearchButtonTitle: '从收藏中删除这条搜索',
            },
            errorScreen: {
              titleText: '无法获取结果',
              helpText: '请检查网络连接。',
            },
            footer: {
              selectText: '选择',
              submitQuestionText: '提交',
              selectKeyAriaLabel: '回车键',
              navigateText: '导航',
              navigateUpKeyAriaLabel: '向上箭头',
              navigateDownKeyAriaLabel: '向下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc 键',
              searchByText: '搜索服务',
            },
            noResultsScreen: {
              noResultsText: '没有找到相关结果',
              suggestedQueryText: '可以试试',
              reportMissingResultsText: '觉得应该有结果？',
              reportMissingResultsLinkText: '反馈缺失内容。',
            },
          },
        },
      },
    },

    nav: [
      { text: '指南', link: '/guide/' },
      { text: '插件', link: '/plugins/' },
      { text: '调试台', link: '/playground' },
      { text: '示例', link: '/demos/' },
      { text: 'API 参考', link: '/api/', target: '_blank' },
      {
        text: 'v5',
        items: [
          { text: 'v4', link: 'https://photo-sphere-viewer-4.netlify.app' },
          { text: 'v3', link: 'https://photo-sphere-viewer-3.netlify.app' },
        ],
      },
      { text: '❤️️ 赞助', link: 'https://github.com/sponsors/mistic100' },
    ],
    socialLinks: [
      { icon: 'cypress', link: 'https://psv-cypress-reports.netlify.app' },
      { icon: 'github', link: 'https://github.com/mistic100/Photo-Sphere-Viewer' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          base: '/guide',
          items: [
            { text: '快速开始', link: '/' },
            { text: '配置项', link: '/config' },
            { text: '方法', link: '/methods' },
            { text: '事件', link: '/events' },
            { text: '导航栏定制', link: '/navbar' },
            { text: '样式', link: '/style' },
            {
              text: '适配器',
              link: '/',
              base: '/guide/adapters',
              collapsed: true,
              items: adapters,
            },
            {
              text: '可复用组件',
              link: '/',
              base: '/guide/components',
              collapsed: true,
              items: [
                { text: '面板', link: '/panel' },
                { text: '通知', link: '/notification' },
                { text: '覆盖层', link: '/overlay' },
                { text: '提示框', link: '/tooltip' },
              ],
            },
            { text: '框架集成', link: '/frameworks' },
          ],
        },
        { text: '更新日志', link: '/guide/changelog' },
        { text: '开发与致谢', link: '/guide/development' },
        { text: '从 v4 迁移', link: '/guide/migration' },
      ],
      '/plugins/': [
        {
          text: '插件',
          base: '/plugins',
          items: [
            { text: '插件介绍', link: '/' },
            { text: '编写插件', link: '/writing-a-plugin' },
            { text: '第三方插件', link: '/third-party' },
          ],
        },
        {
          text: '官方插件',
          base: '/plugins',
          items: getFiles('plugins')
            .filter((f) => {
              return f.endsWith('.md') && f !== 'index.md' && f !== 'writing-a-plugin.md' && f !== 'third-party.md';
            })
            .map((f) => ({
              text: pluginNames[f] ?? startCase(f.replace('.md', '')),
              link: '/' + f,
            })),
        },
        {
          text: '适配器',
          base: '/guide/adapters',
          items: adapters,
        },
      ],
      '/demos/': [
        {
          text: '示例',
          base: '/demos',
          link: '/',
          items: (() => {
            const demoFiles: Record<string, string[]> = getFiles('demos')
              .map((f) => f.split('/'))
              .filter((f) => f.length === 2)
              .reduce((groups, [dir, file]) => {
                (groups[dir] = groups[dir] ?? []).push(file);
                return groups;
              }, {});

            return Object.entries(demoFiles)
              .map(([group, files]) => ({
                text: demoGroups[group] ?? capitalize(group),
                items: files.map((f) => ({
                  text: demoNames[f] ?? startCase(f.replace('.md', '')).replace('0 Config', '零配置'),
                  link: `/${group}/${f}`,
                })),
              }))
              .sort((a, b) => {
                return a.text === 'Basic' ? -1 : b.text === 'Basic' ? 1 : a.text.localeCompare(b.text);
              });
          })(),
        },
      ],
    },
  },

  markdown: {
    codeCopyButtonTitle: '复制代码',
    config(md) {
      codeDemo(md);
      dialog(md);
      gallery(md);
      module(md);
      tabs(md);
    },
  },

  vite: {
    ssr: {
      noExternal: [/^vuetify/],
    },

    build: {
      rollupOptions: {
        external: Object.keys(externals),
      },
    },

    resolve: {
      alias: {
        ...externals,
        '@components': resolve(import.meta.dirname, './components'),
      },
    },

    // for dev
    plugins: [
      {
        name: 'import-map',
        enforce: 'pre',
        transformIndexHtml(html) {
          return html.replace('<head>', `<head>${importmap}`);
        },
      },
    ],
  },

  // for build
  transformHtml(html) {
    return html.replace('<head>', `<head>${importmap}`);
  },
});
