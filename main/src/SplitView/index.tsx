import ResizeObserver from "resize-observer-polyfill";
import React, { Component, createRef, ReactNode } from "react";
import { Root } from "./SplitView.style";
import { Bar } from "./parts/Bar";
import { Child } from "./parts/Child";
import { Manager } from "@jswf/manager";

export type SplitType = "ns" | "sn" | "we" | "ew";

interface SplitProps {
  type?: SplitType;
  pos?: number;
  activeSize?: number;
  activeWait?: number;
  bold?: number;
  children?: ReactNode | null;
  style?: React.CSSProperties;
}
interface State {
  pos: number;
  activeMode: boolean;
  barOpen: boolean;
}
/**
 *画面分割コンポーネント
 *
 * @export
 * @class SplitView
 * @extends {Component<SplitProps, { pos: number }>}
 */
export class SplitView extends Component<SplitProps, State> {
  static defaultProps: SplitProps = {
    type: "ew",
    bold: 16,
    pos: 200,
    activeWait: 3000,
    activeSize: 300,
    style: {},
  };
  private type: SplitType;
  private activeStop: boolean = false;
  private closeHandle?: number;
  private layoutHandle?: number;
  private resizeObserver?: ResizeObserver;
  private rootRef = createRef<HTMLDivElement>();
  private childRef = [createRef<HTMLDivElement>(), createRef<HTMLDivElement>()];
  public constructor(props: SplitProps) {
    super(props);
    this.state = {
      pos: props.pos!,
      activeMode: false,
      barOpen: true,
    };
    this.type = props.type!;
  }
  public render() {
    const children = React.Children.toArray(this.props.children);
    return (
      <Root ref={this.rootRef} style={this.props.style!}>
        <Child
          ref={this.childRef[1]}
          onClick={() => {
            this.activeStop = false;
            this.closeBar();
          }}
        >
          {children[1]}
        </Child>
        <Child ref={this.childRef[0]} onClick={() => (this.activeStop = true)}>
          {children[0]}
        </Child>
        <Bar
          activeMode={this.state.activeMode}
          open={this.state.barOpen}
          type={this.props.type!}
          size={this.props.bold!}
          pos={this.state.pos}
          procOpen={(open) => this.onOpen(open)}
          procMove={(pos) => this.onMove(pos)}
        ></Bar>
      </Root>
    );
  }
  public componentDidUpdate() {
    if (this.props.type !== this.type) {
      this.type = this.props.type!;
      this.onOpen(true);
      this.onLayout();
    } else this.layout();
  }
  public componentDidMount() {
    Manager.init();
    this.resizeObserver = new ResizeObserver(() => {
      this.layout();
    });
    this.resizeObserver.observe(this.rootRef.current! as Element);
    this.onLayout();
  }
  public componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
  public closeBar() {
    if (this.state.activeMode && !this.activeStop) {
      if (this.closeHandle) {
        clearTimeout(this.closeHandle);
      }
      this.closeHandle = setTimeout(() => {
        if (this.state.activeMode && !this.activeStop) this.onOpen(false);
        this.closeHandle = undefined;
      }, this.props.activeWait!);
    }
  }

  /**
   *分割レイアウトの遅延実行
   *
   * @protected
   * @memberof SplitView
   */
  protected layout() {
    if (!this.layoutHandle) {
      this.layoutHandle = setTimeout(() => {
        this.layoutHandle = undefined;
        this.onLayout();
      }, 1);
    }
  }
  /**
   *分割レイアウト処理
   *
   * @protected
   * @memberof SplitView
   */
  protected onLayout() {
    let activeMode = false;
    let pos = this.state.pos;
    const rootRef = this.rootRef.current;
    if (!rootRef) return;
    const children = [this.childRef[0].current!, this.childRef[1].current!];
    const barSize = this.props.bold!;
    const barType = this.props.type;
    const width = rootRef.offsetWidth;
    const height = rootRef.offsetHeight;

    //アクティブバーの処理
    if (this.props.activeSize! > -1) {
      if (barType === "we" || barType === "ew") {
        const w = width - (pos + barSize);
        if (w < this.props.activeSize!) {
          activeMode = true;
          if (!this.state.activeMode) {
            children[1].style.animation = "DrawerMax 0.5s ease 0s forwards";
          }
        }
      } else {
        const h = height - (pos + barSize);
        if (h < this.props.activeSize!) {
          activeMode = true;
          if (!this.state.activeMode) {
            children[1].style.animation = "DrawerMax 0.5s ease 0s forwards";
          }
        }
      }
      if (activeMode !== this.state.activeMode) {
        this.setState({ activeMode });
        if (!activeMode) {
          this.onOpen(true);
          children[1].style.animation = "DrawerNormal 0.5s ease 0s normal";
        }
        this.closeBar();
      }
    }

    switch (barType) {
      case "we":
        children[0].style.left = "0";
        children[0].style.right = "auto";
        children[0].style.width = pos + "px";
        children[0].style.height = "auto";
        children[0].style.top = "0";
        children[0].style.bottom = "0";
        if (!activeMode) {
          children[1].style.left = pos + barSize + "px";
          children[1].style.right = "0";
          children[1].style.width = "auto";
          children[1].style.height = "auto";
          children[1].style.top = "0";
          children[1].style.bottom = "0";
        }
        break;
      case "ew":
        children[0].style.left = "auto";
        children[0].style.right = "0";
        children[0].style.width = pos + "px";
        children[0].style.height = "auto";
        children[0].style.top = "0";
        children[0].style.bottom = "0";
        if (!activeMode) {
          children[1].style.left = "0";
          children[1].style.right = pos + barSize + "px";
          children[1].style.width = "auto";
          children[1].style.height = "auto";
          children[1].style.top = "0";
          children[1].style.bottom = "0";
        }
        break;
      case "ns":
        children[0].style.top = "0";
        children[0].style.bottom = "auto";
        children[0].style.width = "auto";
        children[0].style.height = pos + "px";
        children[0].style.left = "0";
        children[0].style.right = "0";
        if (!activeMode) {
          children[1].style.top = pos + barSize + "px";
          children[1].style.bottom = "0";
          children[1].style.width = "auto";
          children[1].style.height = "auto";
          children[1].style.left = "0";
          children[1].style.right = "0";
        }
        break;
      case "sn":
        children[0].style.top = "auto";
        children[0].style.bottom = "0";
        children[0].style.width = "auto";
        children[0].style.height = pos + "px";
        children[0].style.left = "0";
        children[0].style.right = "0";
        if (!activeMode) {
          children[1].style.top = "0";
          children[1].style.bottom = pos + barSize + "px";
          children[1].style.width = "auto";
          children[1].style.height = "auto";
          children[1].style.left = "0";
          children[1].style.right = "0";
        }
        break;
    }
  }

  protected onOpen(open: boolean) {
    const children = [this.childRef[0].current!, this.childRef[1].current!];
    if (open) {
      children[0].style.animation =
        this.props.type + "DrawerShow 0.5s ease 0s normal";
    } else {
      children[0].style.animation =
        this.props.type + "DrawerClose 0.5s ease 0s forwards";
    }
    this.setState({ barOpen: open });
  }
  protected onMove(pos: number) {
    this.setState({ pos });
    this.closeBar();
  }
}
