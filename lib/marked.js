const marked = require('marked');
const Prism = require('node-prismjs');

const renderer = new marked.Renderer();

renderer.code = function (code, infostring, escaped) {
  const lang = (infostring || '').match(/\S*/)[0];
  if (this.options.highlight) {
    const out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '</code></pre>';
  }

  return '<pre class="code_block"><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '</code></pre>\n';
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
  xhtml: true,
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
