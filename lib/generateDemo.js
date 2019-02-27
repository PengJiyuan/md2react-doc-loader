// Custom markdown loader
const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const babel = require('@babel/core');
const template = require('@babel/template').default;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const babelParse = require('./babelParse');
const marked = require('./marked');
const { dangerouslySetInnerHTMLToJsx } = require('./jsx');
const { wrapperBabelConfig } = require('../../babel/config');

// get code block
const codeRegex = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/m;

function generateDemo(context) {
  const files = fs.readdirSync(path.resolve(context, 'demo'));
  const metadata = files.map((file) => {
    const source = fs.readFileSync(path.resolve(context, 'demo', file), 'utf8');
    const fmSource = fm(source);
    const { attributes, body } = fmSource;
    return {
      attributes,
      body
    };
  });
  metadata.sort((a, b) => a.attributes.order - b.attributes.order);

  /** ********************** */
  const demoList = [];
  metadata.filter(meta => !meta.attributes.skip).forEach((meta) => {
    const str = codeRegex.exec(meta.body);
    if (str !== null && (str[3] === 'js' || str[3] === 'javascript')) {
      const ast = babelParse(str[4]);
      const markedBody = marked(meta.body);
      const markedBodyAddHeader = `<div class="header">${meta.attributes.title}</div>${markedBody}`;
      const codePreview = dangerouslySetInnerHTMLToJsx(markedBodyAddHeader);
      const codePreviewAst = babelParse(codePreview);
      let codePreviewBlockAst;
      traverse(codePreviewAst, {
        JSXElement: (_path) => {
          codePreviewBlockAst = _path.node;
        }
      });
      traverse(ast, {
        ImportDeclaration: (_path) => {
          if (_path.node.source.value === 'react') {
            const codeBlockImport = template('import CodeBlock from "@templates/code_block_wrapper";');
            const codeCellImport = template('import CodeCell from "@templates/code_cell";');
            const demoCellImport = template('import DemoCell from "@templates/demo_cell";');
            _path.insertAfter(codeBlockImport());
            _path.insertAfter(codeCellImport());
            _path.insertAfter(demoCellImport());
          }
        },
        CallExpression(_path, state) {
          if (
            _path.node.callee.object
            && _path.node.callee.object.name === 'ReactDOM'
            && _path.node.callee.property.name === 'render'
          ) {
            const returnElement = _path.node.arguments[0];
            const demoCellElement = t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('DemoCell'), []),
              t.jsxClosingElement(t.JSXIdentifier('DemoCell')),
              [returnElement]
            );
            const codeCellElement = t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('CodeCell'), []),
              t.jsxClosingElement(t.JSXIdentifier('CodeCell')),
              [codePreviewBlockAst]
            );
            const codeBlockElement = t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('CodeBlock'), []),
              t.jsxClosingElement(t.JSXIdentifier('CodeBlock')),
              [demoCellElement, codeCellElement]
            );
            const app = t.VariableDeclaration('const', [
              t.VariableDeclarator(t.Identifier('__export'), codeBlockElement)
            ]);
            _path.insertBefore(app);
            _path.remove();
          }
        }
      });
      const { code } = babel.transformFromAstSync(ast, null, wrapperBabelConfig);
      const buildRequire = template(`
        function NAME() {
          AST
          return __export;
        }
      `);

      const finnalAst = buildRequire({
        NAME: `demo${meta.attributes.order}`,
        AST: code
      });

      demoList.push(generate(finnalAst).code);
    }
  });

  const buildRequire = template(`
    const __export = function() {
      CODE
      return [${demoList.map((item, index) => `demo${index}()`).join(',')}];
    }
  `);

  const finnalAst = buildRequire({
    CODE: demoList.join('\n')
  });
  return {
    ast: finnalAst
  };
}

module.exports = generateDemo;
