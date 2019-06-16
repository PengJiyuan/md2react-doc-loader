import React from 'react';
import { IconCode, IconInteraction } from '@byted/byteui/icon';

class CodeCell extends React.PureComponent {
  state = {
    codeOpen: false,
    designOpen: false
  }

  toggleCode = () => {
    this.setState({
      designOpen: false,
      codeOpen: !this.state.codeOpen
    });
  }

  toggleDesign = () => {
    this.setState({
      codeOpen: false,
      designOpen: !this.state.designOpen
    });
  }

  render() {
    const props = this.props;
    const { codeOpen, designOpen } = this.state;
    return (
      <div className={`code ${codeOpen ? '' : 'hide'}`}>
        <div className="select-bar">
          <button onClick={this.toggleDesign} className={`doc_design ${designOpen ? 'active' : ''}`}><IconInteraction style={{ fontSize: 16 }} />查看交互说明</button>
          <button onClick={this.toggleCode} className={`doc_code ${codeOpen ? 'active' : ''}`}><IconCode style={{ fontSize: 16 }} />查看代码</button>
        </div>
        <div className="content-code-design">
          <div className={`design ${designOpen ? '' : 'hide'}`}>
            <div className="design_wrapper">
              {props.design || '暂无交互说明'}
            </div>
          </div>
          <div className={`code ${codeOpen ? '' : 'hide'}`}>
            {props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default CodeCell;
