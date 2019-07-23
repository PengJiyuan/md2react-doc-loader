function dangerouslySetInnerHTMLToJsx(html) {
  html = html.replace(/\n/g, '\\\n').replace(/"/g, '\'');
  return `import React from 'react';
    export default function() {
      return (
        <div className="code-preview" dangerouslySetInnerHTML={{ __html: "<div>${html}</div>" }} />
      );
    };`;
}

function htmlToJsx(html) {
  return `import React from 'react';
    export default function() {
      return (
        <span>${html.replace(/class=/g, 'className=').replace(/{/g, '{"{"{').replace(/}/g, '{"}"}').replace(/{"{"{/g, '{"{"}')}</span>
      );
    };`;
}

exports.dangerouslySetInnerHTMLToJsx = dangerouslySetInnerHTMLToJsx;
exports.htmlToJsx = htmlToJsx;
