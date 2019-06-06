import React from 'react';
import { IconCode, IconInteraction } from '@byted/byteui/icon';

class CodeCell extends React.PureComponent {
  state = {
    codeOpen: false
  }

  toggleCode = () => {
    this.setState({
      codeOpen: !this.state.codeOpen
    });
  }

  render() {
    const props = this.props;
    const { codeOpen } = this.state;
    return (
      <div className={`code ${codeOpen ? '' : 'hide'}`}>
        <div className="select-bar">
          <button className="doc_design disabled"><IconInteraction style={{ fontSize: 16 }} />查看交互说明</button>
          <button onClick={this.toggleCode} className="doc_code"><IconCode style={{ fontSize: 16 }} />查看代码</button>
        </div>
        {props.children}
      </div>
    );
  }
}

export default CodeCell;
