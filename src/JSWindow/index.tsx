import ResizeObserver from "resize-observer-polyfill";
import React, { ReactNode, Component, createRef } from "react";
import { Manager, MovePoint, JWFEvent } from "../lib/Manager";
import { Clinet } from "./parts/Client";
import { Title } from "./parts/Title";
import { Root } from "./parts/Root";
import { Border, borders } from "./parts/Border";

export enum WindowStyle {
  TITLE = 1,
  MAX = 2,
  MIN = 4,
  CLOSE = 8,
  FRAME = 16,
  RESIZE = 32
}
export interface WindowProps {
  x?: number | null;
  y?: number | null;
  width?: number;
  height?: number;
  moveable?: boolean;
  borderSize?: number;
  titleSize?: number;
  title?: string;
  children?: ReactNode | null;
  active?: boolean;
  overlapped?: boolean;
  windowStyle?: number;
  windowState?: WindowState;
  onUpdate?: ((status: WindowInfo) => void) | null;
  clientStyle?:React.CSSProperties;
}
type NonNullableType<T, K extends keyof T = keyof T> = {
  [P in K]-?: T[P];
};
export interface WindowInfo extends NonNullableType<WindowProps> {
  realX: number;
  realY: number;
  realWidth: number;
  realHeight: number;
  clientWidth: number;
  clientHeight: number;
}

export enum WindowState {
  NORMAL = 1,
  MAX,
  MIN,
  HIDE
}

interface State {
  active: boolean;
  overlapped: boolean;
  titlePrmisson: number;
  titleSize: number;
  borderSize: number;
  x: number | null;
  y: number | null;
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  windowState: number;
  oldEnumState: number;
  boxEnumState: number;
}
interface MoveParams {
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 *FrameWindow of React
 *
 * @export
 * @class JswfWindow
 * @extends {Component<WindowProps, State>}
 */
export class JSWindow extends Component<WindowProps, State> {
  static defaultProps: WindowProps = {
    x: null,
    y: null,
    width: 300,
    height: 300,
    moveable: false,
    borderSize: 8,
    titleSize: 32,
    title: "",
    active: false,
    overlapped: true,
    windowStyle: 0xff,
    windowState: WindowState.NORMAL,
    clientStyle:{},
    onUpdate: null
  };

  private rootRef = createRef<HTMLDivElement>();
  private titleRef = createRef<HTMLDivElement>();
  private clientRef = createRef<HTMLDivElement>();
  private resizeObserver?: ResizeObserver;
  private resizeHandle?: number;
  private moveHandle?: number;
  private moveParams?: MoveParams;
  private updateInfoHandle?: number;
  private windowInfo: WindowInfo;
  private windowInfoKeep: WindowInfo;
  /**
   *Creates an instance of JswfWindow.
   * @param {WindowProps} props
   * @memberof JswfWindow
   */
  public constructor(props: WindowProps) {
    super(props);
    let state: State;

    state = {
      active: props.active!,
      overlapped: props.overlapped!,
      titlePrmisson:props.windowStyle!,
      titleSize:(props.windowStyle! & WindowStyle.TITLE) === 0
          ? 0
          : props.titleSize!,
      borderSize: props.borderSize!,
      x: props.x!,
      y: props.y!,
      width: props.width!,
      height: props.height!,
      oldEnumState: WindowState.HIDE,
      windowState: props.windowState!,
      boxEnumState: WindowState.HIDE,
      clientWidth: 0,
      clientHeight: 0
    };

    this.state = state;

    this.windowInfo = {
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
      moveable: props.moveable!,
      borderSize: state.borderSize,
      title: props.title!,
      titleSize: state.titleSize,
      children: (props && props.children) || null,
      active: state.active,
      overlapped: state.overlapped,
      windowStyle: props.windowStyle!,
      windowState: state.windowState,
      onUpdate: props.onUpdate!,
      clientWidth: 0,
      clientHeight: 0,
      clientStyle:props.clientStyle!,
      realX: 0,
      realY: 0,
      realWidth: 0,
      realHeight: 0
    };
    this.windowInfoKeep = objectAssign({}, this.windowInfo);
  }

  /**
   *React componentDidMount
   *
   * @memberof JswfWindow
   */
  public componentDidMount() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    if (node) {
      node._symbol = this;
      if (node.parentNode) {
        this.resizeObserver = new ResizeObserver(() => {
          this.onParentSize();
        });
        this.resizeObserver.observe(node.parentNode as Element);
      }
      node.addEventListener("move", this.onMove.bind(this));
      node.addEventListener("active", this.onActive.bind(this));
    }
    this.update();
  }
  /**
   *React componentWillUnmount
   *
   * @memberof JswfWindow
   */
  public componentWillUnmount() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    if (node) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = undefined;
      }
      node.removeEventListener("move", this.onMove.bind(this));
      node.removeEventListener("active", this.onActive.bind(this));
    }
  }
  public componentDidUpdate() {
    if (this.props.onUpdate) {
      let flag = false;
      for (const key of Object.keys(this.windowInfo)) {
        if (
          this.windowInfo[key as keyof WindowInfo] !==
          this.windowInfoKeep[key as keyof WindowInfo]
        ) {
          flag = true;
          break;
        }
      }
      if (flag) {
        this.windowInfoKeep = objectAssign({}, this.windowInfo);
        if (!this.updateInfoHandle) {
          this.updateInfoHandle = setTimeout(() => {
            if (this.props.onUpdate) this.props.onUpdate(this.windowInfoKeep);
            this.updateInfoHandle = undefined;
          }, 1);
        }
      }
    }
  }
  /**
   * React render
   *
   * @returns
   * @memberof JswfWindow
   */
  public render() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    const clientNode: HTMLElement | null = this.clientRef.current;

    let x, y, width, height, clientWidth, clientHeight;
    if (node && clientNode) {
      node._symbol = this;

      this.changeState();

      //座標系リミットチェック
      const parent = node.parentNode as HTMLElement;
      const parentWidth = this.state.overlapped
        ? window.innerWidth
        : parent.clientWidth;
      const parentHeight = this.state.overlapped
        ? window.innerHeight
        : parent.clientHeight;

      switch (this.state.boxEnumState) {
        case WindowState.MAX:
          x = 0;
          y = 0;
          width = parentWidth;
          height = parentHeight;
          clientWidth = parentWidth;
          clientHeight = parentHeight - this.state.titleSize;

          break;
        case WindowState.MIN:
          width = this.state.width;
          height = this.state.titleSize;
          x = this.state.x;
          y = this.state.y;
          if (x === null) {
            x = (parentWidth - width) / 2;
          } else if (x < 0) x = 0;
          else if (x + this.state.width > parentWidth)
            x = parentWidth - this.state.width;
          if (y === null) {
            y = (parentHeight - height) / 2;
          } else if (y < 0) y = 0;
          else if (y + this.state.titleSize > parentHeight)
            y = parentHeight - this.state.titleSize;
          clientWidth = this.state.width;
          clientHeight = 0;

          break;
        default:
          x = this.state.x;
          y = this.state.y;
          width = this.state.width;
          height = this.state.height;
          if (width > parentWidth) width = parentWidth;
          if (height > parentHeight) height = parentHeight;
          if (x === null) {
            x = (parentWidth - width) / 2;
          } else if (x < 0) x = 0;
          else if (x + width > parentWidth) x = parentWidth - width;
          if (y === null) {
            y = (parentHeight - height) / 2;
          } else if (y < 0) y = 0;
          else if (y + height > parentHeight) y = parentHeight - height;
          clientWidth = width;
          clientHeight = height - this.state.titleSize;

          break;
      }
    } else {
      x = this.state.x;
      y = this.state.y;
      width = this.state.width;
      height = this.state.height;
      clientWidth = width;
      clientHeight = height - this.state.titleSize;
    }
    this.windowInfo = objectAssign(this.windowInfo, {
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height,
      realX: x,
      realY: y,
      realWidth: width,
      realHeight: height,
      windowState: this.state.windowState
    });
    return (
      <Root
        overlapped={this.state.overlapped}
        ref={this.rootRef}
        x={x || 0}
        y={y || 0}
        frame={(this.windowInfo.windowStyle & WindowStyle.FRAME) !== 0}
        width={width}
        height={height}
        titleSize={this.state.titleSize}
        onTouchStart={this.onMouseDown.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
      >
        {WindowStyle.TITLE && (
          <Title
            ref={this.titleRef}
            Active={this.state.active}
            Size={this.state.titleSize}
            id="TITLE"
            onTouchStart={this.onFrame}
            onMouseDown={this.onFrame}
          >
            <div id="text">{this.props.title}</div>
            <div id="icons">
              {(this.state.titlePrmisson & WindowStyle.MIN) !== 0 && (
                <div
                  id="min"
                  onClick={() =>
                    this.setWindowState(
                      this.state.oldEnumState === WindowState.MIN
                        ? WindowState.NORMAL
                        : WindowState.MIN
                    )
                  }
                />
              )}
              {((this.state.titlePrmisson & WindowStyle.MAX) !== 0 &&
                this.state.oldEnumState === WindowState.NORMAL) ||
              this.state.oldEnumState === WindowState.MIN ? (
                <div
                  id="max"
                  onMouseDown={e => {
                    e.stopPropagation();
                  }}
                  onTouchStart={e => {
                    e.stopPropagation();
                  }}
                  onClick={e => {
                    this.setWindowState(WindowState.MAX);
                  }}
                />
              ) : (
                <div
                  id="normal"
                  onMouseDown={e => {
                    e.stopPropagation();
                  }}
                  onTouchStart={e => {
                    e.stopPropagation();
                  }}
                  onClick={e => {
                    this.setWindowState(WindowState.NORMAL);
                  }}
                />
              )}
              {(this.state.titlePrmisson & WindowStyle.CLOSE) !== 0 && (
                <div
                  id="close"
                  onMouseDown={e => {
                    e.stopPropagation();
                  }}
                  onTouchStart={e => {
                    e.stopPropagation();
                  }}
                  onClick={e => {
                    this.setWindowState(WindowState.HIDE);
                  }}
                />
              )}
            </div>
          </Title>
        )}
        {(this.state.titlePrmisson & WindowStyle.RESIZE) !== 0 &&
          borders.map(border => (
            <Border
              key={border}
              id={border}
              Size={this.state.borderSize}
              onTouchStart={this.onFrame.bind(this)}
              onMouseDown={this.onFrame.bind(this)}
            />
          ))}
        <Clinet
          ref={this.clientRef}
          TitleSize={this.state.titleSize}
          Width={clientWidth}
          Height={clientHeight}
          style={this.props.clientStyle!}
        >
          {this.props.children}
        </Clinet>
      </Root>
    );
  }
  /**
   *ウインドウ情報を返す
   *
   * @returns
   * @memberof JswfWindow
   */
  public getWindowInfo() {
    return this.windowInfo;
  }
  /**
   *ウインドウの状態を変更する
   *
   * @param {(WindowState | undefined)} enumState
   *  WindowState.NORMAL
   *  WindowState.MAX
   *  WindowState.MIN
   *  WindowState.HIDE
   * @memberof JswfWindow
   */
  public setWindowState(state: WindowState | undefined) {
    if (state) this.setState({ windowState: state });
  }

  /**
   *ウインドウをフォアグラウンドにする
   *
   * @memberof JswfWindow
   */
  foreground(): void {
    //Activeになるノードを取得
    const activeNodes = new Set<HTMLElement>();
    let node: HTMLElement & { _symbol?: Symbol } | null = this.rootRef.current;
    if (node) {
      let topNode: HTMLElement = node;
      do {
        if (node._symbol instanceof JSWindow) {
          activeNodes.add(node);
          topNode = node;
        }
      } while ((node = node.parentNode as HTMLElement));
      const parent = topNode.parentNode;
      if (parent) {
        const sendActive = (node: HTMLElement & { _symbol?: Symbol }) => {
          if (node._symbol instanceof JSWindow) {
            Manager.callEvent(node, "active", activeNodes.has(node));
          }
          Array.prototype.forEach.call(node.childNodes, node => {
            sendActive(node as HTMLElement);
          });
        };
        sendActive(parent as HTMLElement);
      }
    }
  }
  protected update() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    const clientNode: HTMLElement | null = this.clientRef.current;
    if (node && clientNode) {
      node._symbol = this;
      this.changeState();
    }
  }
  private changeState() {
    if (this.state.oldEnumState === this.state.windowState) return;
    this.setState({ oldEnumState: this.state.windowState });
    switch (this.state.windowState) {
      case WindowState.NORMAL:
        this.normal();
        break;
      case WindowState.MAX:
        this.max();
        break;
      case WindowState.MIN:
        this.min();
        break;
      case WindowState.HIDE:
        this.hide();
        break;
    }
  }
  private min() {
    const rootNode: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    const clientNode: HTMLElement & { _symbol?: JSWindow } | null = this
      .clientRef.current;
    if (!rootNode || !clientNode) return;
    if (this.state.boxEnumState === WindowState.MIN) {
      clientNode.style.animation =
        "MinRestoreClient 0.1s ease 0s 1 alternate forwards";
      rootNode.style.animation =
        "MinRestoreRoot 0.5s ease 0s 1 alternate forwards";

      this.setState({ boxEnumState: WindowState.NORMAL });
    } else {
      // rootNode.style.animation = "";
      // clientNode.style.animation = "";
      const animationProc = () => {
        this.setState({ boxEnumState: WindowState.MIN });
        clientNode.removeEventListener("animationend", animationProc);
        setTimeout(() => {
          rootNode.style.animation = "";
          clientNode.style.animation = "";
        }, 1);
      };
      clientNode.addEventListener("animationend", animationProc);
      setTimeout(() => {
        rootNode.style.animation = "MinRoot 0.5s ease 0s 1 forwards";
        clientNode.style.animation =
          "MinClient 0.5s ease 0s 1 alternate forwards";
      }, 1);
    }
  }
  private max() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    if (!node) return;
    node.style.animation = "";
    setTimeout(() => {
      this.setState({ boxEnumState: WindowState.MAX });
      node.style.animation = "Max 0.5s ease 0s 1 forwards";
    }, 1);
  }
  private normal() {
    if (this.state.oldEnumState === WindowState.MIN) {
      this.min();
      return;
    } else if (this.state.oldEnumState === WindowState.HIDE) {
      const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
        .current;
      if (!node) return;
      const animationEnd = () => {
        node.removeEventListener("animationend", animationEnd);
        node.style.animation = "";
      };
      node.addEventListener("animationend", animationEnd);
      node.style.animation = "Show 0.5s ease 0s none";
      node.style.visibility = "visible";
      this.setState({ boxEnumState: WindowState.NORMAL });
    } else {
      const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
        .current;
      if (!node) return;
      node.style.animation = "";
      setTimeout(() => {
        this.setState({ boxEnumState: WindowState.NORMAL });
        node.style.animation = "Restore 0.5s ease 0s forwards";
      }, 1);
    }
  }
  private hide() {
    const node: HTMLElement & { _symbol?: JSWindow } | null = this.rootRef
      .current;
    if (!node) return;
    node.style.animation = "";
    setTimeout(() => {
      node.style.animation = "Hide 0.5s ease 0s forwards";
      this.setState({ boxEnumState: WindowState.HIDE });
    }, 1);
  }
  private onMouseDown(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) {
    if (Manager.moveNode == null) {
      this.foreground();
      Manager.moveNode = this.rootRef.current;
      let p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent);
      Manager.baseX = p.x;
      Manager.baseY = p.y;
      Manager.nodeX = this.windowInfo.realX;
      Manager.nodeY = this.windowInfo.realY;
      Manager.nodeWidth = this.windowInfo.realWidth;
      Manager.nodeHeight = this.windowInfo.realHeight;
      e.stopPropagation();
    } else {
      e.preventDefault();
    }
  }
  //フレームクリックイベントの処理
  private onFrame(
    e:
      | React.TouchEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    if (Manager.frame == null) Manager.frame = e.currentTarget.id;
    //EDGEはここでイベントを止めないとテキスト選択が入る
    //if (WindowManager.frame < 9)
    //	if (e.preventDefault) e.preventDefault(); else e.returnValue = false
  }
  private onActive(e: Event & { params?: boolean }) {
    const act = e.params === true;
    this.setState({ active: act });
    const thisNode = this.rootRef.current!;
    if (act) {
      const parent = thisNode.parentNode;
      if (parent) {
        thisNode.style.zIndex = "99999";

        Array.prototype.slice
          .call(parent.childNodes, 0)
          .filter(node => {
            return (
              (node as typeof node & { _symbol?: JSWindow })
                ._symbol instanceof JSWindow
            );
          })
          .sort((a, b) => {
            const az = a.style.zIndex ? parseInt(a.style.zIndex) : 0;
            const bz = b.style.zIndex ? parseInt(b.style.zIndex) : 0;
            return az - bz;
          })
          .forEach((node, index) => {
            node.style.zIndex = index.toString();
          });
      }
      e.preventDefault();
    }
  }

  private onParentSize() {
    if (this.resizeHandle) return;
    this.resizeHandle = setTimeout(() => {
      this.forceUpdate();
      this.resizeHandle = undefined;
    }, 10);
  }
  private onMove(e: JWFEvent): void {
    // if (WindowManager.frame == null) return;
    if (this.state.windowState === WindowState.MAX) return;
    let [px, py, pwidth, pheight] = [
      this.state.x === null ? this.windowInfo.realX : this.state.x,
      this.state.y === null ? this.windowInfo.realY : this.state.y,
      this.state.width,
      this.state.height
    ];
    let p = e.params as MovePoint;
    //選択されている場所によって挙動を変える
    let frameIndex = Manager.frame || "";
    switch (frameIndex) {
      case "TOP":
        py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
        break;
      case "RIGHT":
        pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
        break;
      case "BOTTOM":
        pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
        break;
      case "LEFT":
        px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
        break;
      case "LEFT-TOP":
        px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
        pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
        break;
      case "RIGHT-TOP":
        py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
        pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y);
        break;
      case "LEFT-BOTTOM":
        px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x);
        pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
        break;
      case "RIGHT-BOTTOM":
        pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x);
        pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y);
        break;
      case "TITLE":
        px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
        py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        break;
      default:
        //クライアント領域
        if (this.props.moveable) {
          px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x;
          py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y;
        } else return;
    }
    this.moveParams = {
      x: px,
      y: py,
      height: pheight,
      width: pwidth
    };
    if (!this.moveHandle) {
      this.moveHandle = setTimeout(() => {
        this.setState(this.moveParams!);
        this.moveHandle = undefined;
      }, 10);
    }
    //

    //移動フレーム処理時はイベントを止める
    p.event.preventDefault();
    try {
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    } catch (e) {
      //
    }
  }
}
function objectAssign<T, U>(target: T, src: U): T & U {
  if (Object.assign) {
    return Object.assign(target, src);
  }
  for (const key of Object.keys(src)) {
    target[key as keyof T] = src[key as keyof U] as never;
  }
  return target as T & U;
}
