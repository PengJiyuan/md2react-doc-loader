import React from 'react';
import './style.less';

export default function CodeBlockWrapper(props) {
  return (
    <div id={props.id} className="codebox-wrapper">
      {props.children}
    </div>
  );
}
