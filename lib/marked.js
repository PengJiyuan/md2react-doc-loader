const marked = require('marked');
const Prism = require('node-prismjs');

const renderer = new marked.Renderer();

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
  highlight(code, lang) {
    if (lang === 'js' || lang === 'javascript') {
      lang = 'jsx';
    }
    const language = Prism.languages[lang] || Prism.languages.autoit;
    const parsedCode = Prism.highlight(code, language);
    return parsedCode.replace(/\n/g, '<br />');
  }
});

module.exports = marked;
