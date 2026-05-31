export const readme = (pkg: any) =>
  `# ${pkg.psv.title}

[![NPM version](https://img.shields.io/npm/v/${pkg.name}?logo=npm)](https://www.npmjs.com/package/${pkg.name})
[![NPM Downloads](https://img.shields.io/npm/dm/${pkg.name}?color=f86036&label=npm&logo=npm)](https://npmtrends.com/${pkg.name})
[![jsDelivr Hits](https://img.shields.io/jsdelivr/npm/hm/${pkg.name}?color=%23f86036&logo=jsdelivr)](https://www.jsdelivr.com/package/npm/${pkg.name})
[![Bundle size](https://img.shields.io/bundlephobia/minzip/${pkg.name}?logo=webpack&label=gzip)](https://bundlephobia.com/package/${pkg.name})

${pkg.description}

## Documentation

${pkg.homepage}

## License

本库基于 MIT 许可证发布。
`;
