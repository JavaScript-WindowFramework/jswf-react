import ResizeObserver from "resize-observer-polyfill";
import React, { Component, createRef, ReactNode } from "react";
import { Manager, JWFEvent, MovePoint } from "../lib/Manager";
import { Root } from "./parts/Root";
import { Bar } from "./parts/Bar";
import { Child } from "./parts/Child";

export type SplitType = "ns" | "sn" | "we" | "ew";

interface SplitProps {
  type?: SplitType;
  pos?: number;
  activeSize?: number;
  barSize?: number;
  children?: ReactNode | null;
  style?: React.CSSProperties;
}

/**
 *画面分割コンポーネント
 *
 * @export
 * @class SplitView
 * @extends {Component<SplitProps, { pos: number }>}
 */

interface State {
  pos: number;
  activeMode: boolean;
  barOpen: boolean;
}
export class SplitView extends Component<SplitProps, State> {
  static defaultProps = {
    type: "we",
    barSize: 8,
    pos: 100,
    activeSize: 300,
    style: {}
  };
  private closeHandle?: number;
  private resizeObserver?: ResizeObserver;
  private rootRef = createRef<HTMLDivElement>();
  private splitterRef = createRef<HTMLDivElement>();
  private childRef = [createRef<HTMLDivElement>(), createRef<HTMLDivElement>()];
  private children: (ReactNode | undefined)[] = [undefined, undefined];
  public constructor(props: SplitProps) {
    super(props);
    this.state = { pos: props.pos!, activeMode: false, barOpen: true };
    if (props.children) {
      if (props.children instanceof Array) {
        this.children = props.children;
      }
    }
  }
  public render() {
    return (
      <Root ref={this.rootRef} style={this.props.style!}>
        <Child ref={this.childRef[1]}>{this.children[1]}</Child>
        <Child ref={this.childRef[0]}>{this.children[0]}</Child>
        <Bar
          activeMode={this.state.activeMode}
          open={this.state.barOpen}
          refs={this.splitterRef}
          onTouchStart={this.onMouseDown.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          type={this.props.type!}
          size={this.props.barSize!}
          pos={this.state.pos}
          procOpen={open => this.onOpen(open)}
        ></Bar>
      </Root>
    );
  }
  componentDidUpdate() {
    this.onLayout();
  }
  public componentDidMount() {
    const node = this.splitterRef.current!;
    node.addEventListener("move", this.onMove.bind(this));

    this.resizeObserver = new ResizeObserver(() => {
      this.onLayout();
    });
    this.resizeObserver.observe(this.rootRef.current! as Element);

    this.onLayout();
  }
  public componentWillUnmount() {
    const node = this.splitterRef.current!;
    node.removeEventListener("move", this.onMove.bind(this));
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
  protected onMove(e: JWFEvent) {
    let p = e.params as MovePoint;
    let pos = this.state.pos;
    switch (this.props.type!) {
      case "we":
        pos = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        break;
      case "ew":
        pos = p.nodePoint.x - (p.nowPoint.x - p.basePoint.x);
        break;
      case "ns":
        pos = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        break;
      case "sn":
        pos = p.nodePoint.y - (p.nowPoint.y - p.basePoint.y);
        break;
    }
    this.setState({ pos });
  }
  closeBar() {
    if (this.closeHandle) {
      clearTimeout(this.closeHandle);
    }
    setTimeout(() => {
      // this.onOpen(false);
      this.closeHandle = undefined;
    }, 2000);
  }
  protected onLayout() {
    let activeMode = false;
    let pos = this.state.pos;
    const rootRef = this.rootRef!.current!;
    const children = [this.childRef[0].current!, this.childRef[1].current!];
    const barSize = this.props.barSize!;
    const barType = this.props.type;
    const width = rootRef.offsetWidth;
    const height = rootRef.offsetHeight;

    if (barType === "we" || barType === "ew") {
      const w = width - (pos + barSize);
      if (w < this.props.activeSize!) {
        activeMode = true;
        if (!this.state.activeMode) {
          children[1].style.left = "0";
          children[1].style.right = "0";
          children[1].style.width = null;
          children[1].style.height = null;
          children[1].style.top = "0";
          children[1].style.bottom = "0";
          this.closeBar();
        }
      }
    } else {
      const h = height - (pos + barSize);
      if (h < this.props.activeSize!) {
        activeMode = true;
        if (!this.state.activeMode) {
          children[1].style.left = "0";
          children[1].style.right = "0";
          children[1].style.top = "0";
          children[1].style.bottom = "0";
          children[1].style.width = null;
          children[1].style.height = null;
          this.closeBar();
        }
      }
    }
    if (activeMode !== this.state.activeMode) {
      if (!activeMode) {
        this.onOpen(true);
      }
      this.setState({ activeMode });
    }

    switch (barType) {
      case "we":
        children[0].style.left = "0";
        children[0].style.right = null;
        children[0].style.width = pos + "px";
        children[0].style.height = null;
        children[0].style.top = "0";
        children[0].style.bottom = "0";
        if (!activeMode) {
          children[1].style.left = pos + barSize + "px";
          children[1].style.right = "0";
          children[1].style.width = null;
          children[1].style.height = null;
          children[1].style.top = "0";
          children[1].style.bottom = "0";
        }
        break;
      case "ew":
        children[0].style.left = null;
        children[0].style.right = "0";
        children[0].style.width = pos + "px";
        children[0].style.height = null;
        children[0].style.top = "0";
        children[0].style.bottom = "0";
        if (!activeMode) {
          children[1].style.left = "0";
          children[1].style.right = pos + barSize + "px";
          children[1].style.width = null;
          children[1].style.height = null;
          children[1].style.top = "0";
          children[1].style.bottom = "0";
        }
        break;
      case "ns":
        children[0].style.top = "0";
        children[0].style.bottom = null;
        children[0].style.width = null;
        children[0].style.height = pos + "px";
        children[0].style.left = "0";
        children[0].style.right = "0";
        if (!activeMode) {
          children[1].style.top = pos + barSize + "px";
          children[1].style.bottom = "0";
          children[1].style.width = null;
          children[1].style.height = null;
          children[1].style.left = "0";
          children[1].style.right = "0";
        }
        break;
      case "sn":
        children[0].style.top = null;
        children[0].style.bottom = "0";
        children[0].style.width = null;
        children[0].style.height = pos + "px";
        children[0].style.left = "0";
        children[0].style.right = "0";
        if (!activeMode) {
          children[1].style.top = "0";
          children[1].style.bottom = pos + barSize + "px";
          children[1].style.width = null;
          children[1].style.height = null;
          children[1].style.left = "0";
          children[1].style.right = "0";
        }
        break;
    }
  }
  protected onMouseDown(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) {
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
  onOpen(open: boolean) {
    const children = this.childRef[0].current!;
    if (open) {
      children.style.animation =
        this.props.type + "DrawerShow 0.5s ease 0s forwards";
    } else {
      children.style.animation =
        this.props.type + "DrawerClose 0.5s ease 0s forwards";
    }
    this.setState({ barOpen: open });
  }
}
