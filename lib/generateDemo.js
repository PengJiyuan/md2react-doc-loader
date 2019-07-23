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
const { dangerouslySetInnerHTMLToJsx, htmlToJsx } = require('./jsx');

// get code block
const codeRegex = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/m;
const designRegex = /---Design---\n*([.\n\S]*)\n*---Design---/;

function generateDemo(context, options) {
  const demoDir = options.demoDir || 'demo';
  const babelConfig = options.babelConfig || {};
  const templateDir = options.templateDir || path.resolve(__dirname, '../templates');
  const files = fs.readdirSync(path.resolve(context, demoDir));
  const metadata = files.map((file) => {
    const source = fs.readFileSync(path.resolve(context, demoDir, file), 'utf8');
    const fmSource = fm(source);
    const { attributes, body } = fmSource;
    return {
      attributes,
      body,
    };
  });
  metadata.sort((a, b) => a.attributes.order - b.attributes.order);

  /** ********************** */
  const demoList = [];
  metadata.filter(meta => !meta.attributes.skip).forEach((meta) => {
    const str = codeRegex.exec(meta.body);
    const design = designRegex.exec(meta.body);
    if (str !== null && (str[3] === 'js' || str[3] === 'javascript')) {
      let finalMarkedBody = meta.body.replace(str[0], '');
      let designAst;
      let codeAttribute = [];
      if (design !== null) {
        const markedDesign = marked(design[1]);
        const designOriginAst = babelParse(htmlToJsx(markedDesign));
        traverse(designOriginAst, {
          JSXElement: (_path) => {
            designAst = _path.node;
            _path.stop();
          }
        });
        codeAttribute = [t.jsxAttribute(t.JSXIdentifier('design'), t.jsxExpressionContainer(designAst))];
      }
      if (design) {
        finalMarkedBody = finalMarkedBody.replace(design[0], '');
      }
      const ast = babelParse(str[4]);
      let markedBody = marked(finalMarkedBody);
      const markedBodyAddHeader = `<div class="header">${meta.attributes.title}</div>${markedBody}`;
      const descriptionOriginAst = babelParse(dangerouslySetInnerHTMLToJsx(markedBodyAddHeader));
      const codeOriginAst = babelParse(dangerouslySetInnerHTMLToJsx(marked(str[0])));
      let codePreviewBlockAst;
      let descriptionAst;
      traverse(descriptionOriginAst, {
        JSXElement: (_path) => {
          descriptionAst = _path.node;
          _path.stop();
        }
      });
      traverse(codeOriginAst, {
        JSXElement: (_path) => {
          codePreviewBlockAst = _path.node;
          _path.stop();
        }
      });
      traverse(ast, {
        ImportDeclaration: (_path) => {
          if (_path.node.source.value === 'react') {
            const codeBlockImport = template(`import CodeBlock from "${templateDir}/code_block_wrapper";`);
            const codeCellImport = template(`import CodeCell from "${templateDir}/code_cell";`);
            const demoCellImport = template(`import DemoCell from "${templateDir}/demo_cell";`);
            const descriptionCellImport = template(`import DescriptionCell from "${templateDir}/description_cell";`);
            _path.insertAfter(codeBlockImport());
            _path.insertAfter(codeCellImport());
            _path.insertAfter(demoCellImport());
            _path.insertAfter(descriptionCellImport());
          }
        },
        CallExpression(_path) {
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
              t.jsxOpeningElement(t.JSXIdentifier('CodeCell'), codeAttribute),
              t.jsxClosingElement(t.JSXIdentifier('CodeCell')),
              [codePreviewBlockAst]
            );
            const descriptionCellElement = t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('DescriptionCell'), []),
              t.jsxClosingElement(t.JSXIdentifier('DescriptionCell')),
              [descriptionAst]
            );
            const codeBlockElement = t.jsxElement(
              t.jsxOpeningElement(t.JSXIdentifier('CodeBlock'), [
                t.jsxAttribute(t.JSXIdentifier('id'), t.stringLiteral(meta.attributes.title))
              ]),
              t.jsxClosingElement(t.JSXIdentifier('CodeBlock')),
              [demoCellElement, descriptionCellElement, codeCellElement]
            );
            const app = t.VariableDeclaration('const', [
              t.VariableDeclarator(t.Identifier('__export'), codeBlockElement),
            ]);
            _path.insertBefore(app);
            _path.remove();
          }
        }
      });
      const { code } = babel.transformFromAstSync(ast, null, babelConfig);
      const buildRequire = template(`
        function NAME() {
          AST
          return __export;
        }
      `);

      const finnalAst = buildRequire({
        NAME: `demo${meta.attributes.order}`,
        AST: code,
      });

      demoList.push(generate(finnalAst).code);
    }
  });

  // const buildRequire = template(`
  //   const __export = function() {
  //     CODE
  //     return [${demoList.map((item, index) => `demo${index}()`).join(',')}];
  //   }
  // `);
  const buildRequire = template(`
    class Component extends React.Component {
      render() {
        CODE
        return React.createElement('span', {}, ${demoList.map((_, index) => `demo${index}()`).join(',')});
      }
    }
  `);

  const finnalAst = buildRequire({
    CODE: demoList.join('\n'),
  });
  return {
    ast: finnalAst
  };
}

module.exports = generateDemo;
