import React, { Component, createRef, ReactElement } from "react";
import { Manager, JWFEvent, MovePoint } from "../../../lib/Manager";
interface HeaderProps {
  minWidth?: number;
  children?: React.ReactNode;
  onSize: () => void;
  onClick: () => void;
}
interface HeaderState {
  width: number;
  tempWidth: number;
}

/**
 *ListViewヘッダークラス
 *
 * @export
 * @class Header
 * @extends {Component<HeaderProps, HeaderState>}
 */
export class Header extends Component<HeaderProps, HeaderState> {
  static defaultProps = {
    minWidth: 60
  };
  state: HeaderState = { width: -1,tempWidth:0 };
  private type: string = "string";
  private labelRef = createRef<HTMLDivElement>();
  private sliderRef = createRef<HTMLDivElement>();
  public render() {
    const child = this.props.children as ReactElement;
    const label = child.props.children;
    return (
      <div
        style={{ width: Math.max(this.state.tempWidth,this.state.width) + "px" }}
        onClick={this.props.onClick}
      >
        <div id="back">
          <div id="label" ref={this.labelRef}>
            {label}
          </div>
        </div>

        <div
          ref={this.sliderRef}
          id="slider"
          onTouchStart={this.onSlider.bind(this)}
          onMouseDown={this.onSlider.bind(this)}
          onClick={e => e.stopPropagation()}
        ></div>
      </div>
    );
  }
  public componentDidMount() {
    const node = this.sliderRef.current!;
    node.addEventListener("move", this.onMove.bind(this));

    const child = this.props.children as ReactElement;
    if (child.props["data-type"]) {
      this.type = child.props["data-type"];
    }
    let width = -1;
    if (child.props["data-width"]) {
      width = child.props["data-width"];
    }
    if (width < 0) {
      const label = this.labelRef.current!;
      width = label.offsetWidth;
      if (width < this.props.minWidth!) width = this.props.minWidth!;
    }
    this.setState({ width }, () => {
      this.props.onSize();
    });
  }
  public componentWillUnmount() {
    const node = this.sliderRef.current!;
    node.removeEventListener("move", this.onMove.bind(this));
  }
  public getWidth() {
    return Math.max(this.state.width,this.state.tempWidth);
  }
  public getTempWidth() {
    return this.state.tempWidth;
  }
  public getType() {
    return this.type;
  }
  protected onSlider(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) {
    if (Manager.moveNode == null) {
      const node = e.target as HTMLDivElement;
      Manager.moveNode = node;
      let p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent);
      Manager.baseX = p.x;
      Manager.baseY = p.y;
      Manager.nodeX = this.state.width;
      Manager.nodeY = this.state.width;
      Manager.nodeWidth = node.offsetWidth;
      Manager.nodeHeight = node.offsetHeight;
    }
  }
  protected onMove(e: JWFEvent) {
    let p = e.params as MovePoint;
    let width = p.nodePoint.x + (p.nowPoint.x - p.basePoint.x);
    if (width < this.props.minWidth!) width = this.props.minWidth!;
    this.setState({ width });
    this.props.onSize();
  }
}
