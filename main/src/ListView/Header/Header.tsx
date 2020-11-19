import React, { Component, createRef } from "react";
import { Manager, MEvent, MovePoint } from "@jswf/manager";
interface HeaderProps {
  type?: "string" | "number";
  width?: number;
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
    minWidth: 60,
    width: -1,
    type: "string",
  };
  state: HeaderState;
  private labelRef = createRef<HTMLDivElement>();
  private sliderRef = createRef<HTMLDivElement>();
  constructor(props: HeaderProps) {
    super(props);
    this.state = { width: this.props.width!, tempWidth: 0 };
  }
  public render() {
    const label = this.props.children;
    return (
      <div
        style={{
          width: Math.max(this.state.tempWidth, this.state.width) + "px",
        }}
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
          onClick={(e) => e.stopPropagation()}
        ></div>
      </div>
    );
  }
  public componentDidMount() {
    const node = this.sliderRef.current!;
    node.addEventListener("move", this.onMove.bind(this));
    this.props.onSize();

    let width = this.props.width!;
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
    return Math.max(this.state.width, this.state.tempWidth);
  }
  public getTempWidth() {
    return this.state.tempWidth;
  }
  public getType() {
    return this.props.type!;
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
  protected onMove(e: MEvent) {
    let p = e.params as MovePoint;
    let width = p.nodePoint.x + (p.nowPoint.x - p.basePoint.x);
    if (width < this.props.minWidth!) width = this.props.minWidth!;
    this.setState({ width }, () => {
      this.props.onSize();
    });
  }
}
