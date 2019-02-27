const parser = require('@babel/parser');

function parse(codeBlock) {
  return parser.parse(codeBlock, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'classProperties'
    ]
  });
}

module.exports = parse;
