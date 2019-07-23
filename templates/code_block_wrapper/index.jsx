import React from 'react';
import './style.less';

export default function CodeBlockWrapper(props) {
  const id = props.id.replace(/[\s/]/g, '-');
  return (
    <div id={id} className="codebox-wrapper">
      {props.children}
    </div>
  );
}
