import { Component, createRef } from "react";
import React from "react";

import styled from "styled-components";
import { Manager, JWFEvent, MovePoint } from "../lib/Manager";

interface StyleProps {
  type?: 'ns' | 'sn' | 'we' | 'ew';
  pos?: number;
}
export const Root = styled.div.attrs<StyleProps>(p => ({
  style: {
  }
})) <StyleProps>`
& {
  position:absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
  background-color:blue;
}
  `

interface BarProps {
  pos: number;
  size: number;
  type: 'ns' | 'sn' | 'we' | 'ew';
}
export const Bar = styled.div.attrs<BarProps>(p => {
  let style = {};
  switch (p.type) {
    case 'we':
      style = {
        top: 0,
        bottom: 0,
        left: p.pos + 'px',
        width: p.size + 'px',
        cursor: 'ew-resize'
      }
      break;
    case 'ew':
      style = {}
      break;
    case 'ns':
      style = {}
      break;
    case 'sn':
      style = {}
      break;
  }
  return { style };
}) <BarProps>`

    position:absolute;
    box-sizing: border-box;
    background-color: #777777;
    border: outset  2px #b8b7b7;
    user-select: none;
  `
export class SplitView extends Component<StyleProps, { pos: number }> {
  splitterRef = createRef<HTMLDivElement>();
  barType: 'ns' | 'sn' | 'we' | 'ew' = 'we';
  constructor(props: StyleProps) {
    super(props);
    if (props.type)
      this.barType = props.type;

    this.state = { pos: props.pos !== undefined ? props.pos : 100 };

  }
  render() {
    return (
      <Root id="root">
        <Bar ref={this.splitterRef} onTouchStart={this.onMouseDown.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)} type='we' size={8} pos={this.state.pos} />
      </Root>)
  }
  public componentDidMount() {
    const node = this.splitterRef.current!;
    node.addEventListener("move", this.onMove.bind(this));
  }
  public componentWillUnmount() {
    const node = this.splitterRef.current!;
    node.removeEventListener("move", this.onMove.bind(this));
  }
  onMove(e: JWFEvent) {
    let p = e.params as MovePoint;
    let pos = this.state.pos;
    switch (this.barType) {
      case "we":
        pos = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        break;
    }
    console.log(pos);
    this.setState({ pos });
  }
  onMouseDown(e:
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>) {
    if (Manager.moveNode == null) {
      const node = this.splitterRef.current!;
      Manager.moveNode = node;
      let p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent);
      Manager.baseX = p.x;
      Manager.baseY = p.y;
      Manager.nodeX = this.state.pos;
      Manager.nodeY = this.state.pos;
      Manager.nodeWidth = node.offsetWidth;
      Manager.nodeHeight = node.offsetHeight;
      e.stopPropagation();
    } else {
      e.preventDefault();
    }
  }
}