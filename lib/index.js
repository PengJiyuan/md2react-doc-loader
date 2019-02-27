// Custom markdown loader
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const loaderUtils = require('loader-utils');
const generateDemo = require('./generateDemo');
const marked = require('./marked');
const { htmlToJsx } = require('./jsx');
const babelParse = require('./babelParse');

module.exports = (content) => {
  const loaderOptions = loaderUtils.getOptions(this) || {};
  const contentToJsCode = htmlToJsx(marked(content));
  const contentAst = babelParse(contentToJsCode);
  const { ast } = generateDemo(this.context, loaderOptions);
  traverse(contentAst, {
    JSXElement: (_path) => {
      if (_path.node.children[0].value === '%%Content%%') {
        const expresstion = t.jsxExpressionContainer(t.callExpression(t.identifier('__export'), []));
        _path.replaceWith(expresstion);
        _path.stop();
      }
    },
  });
  traverse(contentAst, {
    ReturnStatement: (_path) => {
      _path.insertBefore(ast);
      _path.stop();
    },
  });

  return generate(contentAst).code;
};
