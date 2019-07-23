import React from 'react';
import { findDOMNode } from 'react-dom';
import { Tooltip } from '@byted/byteui';
import { IconCode, IconInteraction, IconCopy, IconCodeSandbox, IconCodepen } from '@byted/byteui/icon';
import ClipboardJS from 'clipboard';

class CodeCell extends React.PureComponent {
  state = {
    codeOpen: false,
    designOpen: false,
    copyContent: '复制代码'
  }

  componentDidMount() {
    const clipboard = new ClipboardJS(this.clipButton, {
      target: () => {
        return findDOMNode(this).querySelector('.language-js');
      }
    });
    clipboard.on('success', (e) => {
      e.clearSelection();
      this.setState({ copyContent: '已复制' });
      this.triggerCopy.updatePopupPosition();
    });
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

  onVisibleChange = (visible) => {
    if (!visible) {
      setTimeout(() => {
        this.setState({ copyContent: '复制代码' });
      }, 300);
    }
  }

  render() {
    const props = this.props;
    const { codeOpen, designOpen, copyContent } = this.state;
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
            <Tooltip content="在 CodePen 中打开" position="left">
              <button className="button codepen">
                <IconCodepen />
              </button>
            </Tooltip>
            <Tooltip content="在 CodeSandbox 中打开" position="left">
              <button className="button codesandbox">
                <IconCodeSandbox />
              </button>
            </Tooltip>
            <Tooltip onVisibleChange={this.onVisibleChange} ref={ref => this.triggerCopy = ref} content={copyContent} position="left">
              <button className="button copy" ref={ref => this.clipButton = ref}>
                <IconCopy />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}

export default CodeCell;
