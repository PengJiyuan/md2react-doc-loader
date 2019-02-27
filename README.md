# md2react-doc-loader

This is a Webpack loader, will translate markdown to react component.

And if you specify demo folder, it will generate demo effect and code preview.

## Install

```bash
npm i md2react-doc-loader -D
```

## Usage

webpack documentation: [Loaders](https://webpack.js.org/loaders/)

Within your webpack configuration object, you'll need to add the md2react-doc-loader to the list of modules, like so:

You should put `babel-loader` before md2react-doc-loader, because md2react-doc-loader's output is ES6 format and contains jsx.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import MD from './README.md';

ReactDOM.render(<MD />, document.getElementById('container'));
```

```js
module: {
  rules: [
    {
      test: /\.md$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            ...
          }
        },
        {
          loader: 'md2react-doc-loader',
          options: {
            demoDir: 'demo',
            templateDir: '@templates',
            babelConfig: {
              ...
            }
          }
        }
      ]
    }
  ]
}
```

## Options

### demoDir [string]

`default: demo`

Specify demo dir, relative to your entry md file.

### templateDir [string]

`default: node_modules/md2react-doc-loader/tempaltes`

Tempalte dir for md2react-doc-loader.

### babelConfig [object]

See [Babel config](https://babeljs.io/docs/en/next/options).

For compile markdown jsx.

## LICENSE

[MIT](./LICENSE) @[PengJiyuan](https://github.com/PengJiyuan)
