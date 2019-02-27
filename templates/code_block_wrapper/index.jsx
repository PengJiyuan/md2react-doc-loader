import React from 'react';
import './style.less';

export default function CodeBlockWrapper(props) {
  return (
    <div className="codebox-wrapper">
      {props.children}
    </div>
  );
}
