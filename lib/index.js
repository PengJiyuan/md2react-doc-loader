// Custom markdown loader
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const loaderUtils = require('loader-utils');
const generateDemo = require('./generateDemo');
const marked = require('./marked');
const { htmlToJsx } = require('./jsx');
const babelParse = require('./babelParse');

module.exports = function (content) {
  const loaderOptions = loaderUtils.getOptions(this) || {};
  const contentToJsCode = htmlToJsx(marked(content));
  const contentAst = babelParse(contentToJsCode);
  let ast;
  let needReplaceDemo = true;
  try {
    ast = generateDemo(this.context, loaderOptions).ast;
  } catch (err) {
    console.log('DDDDDDDDDDD', this.context);
    if (this.context === '/Users/houyoshimoto/pengjiyuan/bytedance/byteui/components/Carousel') {
      throw err;
    }
    console.warn('No demo folder.');
    needReplaceDemo = false;
  }
  if (needReplaceDemo) {
    traverse(contentAst, {
      JSXElement: (_path) => {
        if (_path.node.children[0].value === '%%Content%%') {
          needReplaceDemo = true;
          // const expresstion = t.jsxExpressionContainer(t.callExpression(t.identifier('__export'), []));
          const expresstion = t.jsxExpressionContainer(
            t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('Component'), [], true), null, [], true
            )
          );
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
  }

  return generate(contentAst).code;
};
