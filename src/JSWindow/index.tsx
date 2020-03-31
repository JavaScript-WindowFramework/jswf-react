import ResizeObserver from "resize-observer-polyfill";
import React, { ReactNode, Component, createRef } from "react";
import { Manager, MovePoint,MEvent } from "@jswf/manager";
import { Client } from "./parts/Client";
import { Title } from "./parts/Title";
import { Root } from "./JSWindow.style";
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
  zoomSensitivity?: number;
  minScale?: number;
  maxScale?: number;
  moveable?: boolean;
  workspace?: boolean;
  borderSize?: number;
  titleSize?: number;
  title?: string;
  children?: ReactNode | null;
  active?: boolean;
  overlapped?: boolean;
  windowStyle?: number;
  windowState?: WindowState;
  onUpdate?: ((status: WindowInfo) => void) | null;
  clientStyle?: React.CSSProperties;
}
type NonNullableType<T, K extends keyof T = keyof T> = {
  [P in K]-?: T[P];
};
export interface WindowInfo extends NonNullableType<WindowProps> {
  realX: number;
  realY: number;
  realWidth: number;
  realHeight: number;
  realWindowState: WindowState;
  clientWidth: number;
  clientHeight: number;
}

export enum WindowState {
  NORMAL = 1,
  MAX,
  MIN,
  HIDE
}

interface ZoomTransformState {
  originX: number;
  originY: number;
  translateX: number;
  translateY: number;
  scale: number;
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
  transformation: ZoomTransformState;
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
    zoomSensitivity: 25,
    minScale: 0.1,
    maxScale: 10,
    moveable: false,
    workspace: false,
    borderSize: 16,
    titleSize: 40,
    title: "",
    active: true,
    overlapped: true,
    windowStyle: 0xff,
    windowState: WindowState.NORMAL,
    clientStyle: {},
    onUpdate: null
  };

  private rootRef = createRef<HTMLDivElement>();
  private titleRef = createRef<HTMLDivElement>();
  private clientRef = createRef<HTMLDivElement>();
  private zoomRef = createRef<HTMLDivElement>();
  private resizeObserver?: ResizeObserver;
  private resizeHandle?: number;
  private moveHandle?: number;
  private moveParams?: MoveParams;
  private updateInfoHandle?: number;
  private windowInfo: WindowInfo;
  private windowInfoKeep: WindowInfo;
  flagWindowState: boolean = false;
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
      titlePrmisson: props.windowStyle!,
      titleSize:
        (props.windowStyle! & WindowStyle.TITLE) === 0 ? 0 : props.titleSize!,
      borderSize: props.borderSize!,
      x: props.x || 0,
      y: props.y || 0,
      width: props.width!,
      height: props.height!,
      transformation: {
        originX: 0,
        originY: 0,
        translateX: 0,
        translateY: 0,
        scale: 1
      },
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
      zoomSensitivity: props.zoomSensitivity!,
      minScale: props.minScale!,
      maxScale: props.maxScale!,
      moveable: props.moveable!,
      workspace: props.workspace!,
      borderSize: state.borderSize,
      title: props.title!,
      titleSize: state.titleSize,
      children: (props && props.children) || null,
      active: state.active,
      overlapped: state.overlapped,
      windowStyle: props.windowStyle!,
      windowState: state.windowState,
      realWindowState: state.boxEnumState,
      onUpdate: props.onUpdate!,
      clientWidth: 0,
      clientHeight: 0,
      clientStyle: props.clientStyle!,
      realX: 0,
      realY: 0,
      realWidth: 0,
      realHeight: 0
    };
    this.windowInfoKeep = { ...this.windowInfo };
  }
  shouldComponentUpdate(props: WindowProps, state: State) {
    if (!this.flagWindowState) {
      if (props !== this.props && props.windowState !== state.windowState){
        this._setWindowState(props.windowState);
      }
    }
    return true;
  }
  /**
   *React componentDidMount
   *
   * @memberof JswfWindow
   */
  public componentDidMount() {
    Manager.init();
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
    if (this.props.active!) this.foreground();
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
        this.windowInfoKeep = {
          ...this.windowInfo
        };
        if (!this.updateInfoHandle) {
          if (this.props.onUpdate) this.props.onUpdate(this.windowInfoKeep);
        }
      }
    }
    this.changeState();
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
          }
          if (y === null) {
            y = (parentHeight - height) / 2;
          }
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
          }
          if (y === null) {
            y = (parentHeight - height) / 2;
          }
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
    this.windowInfo = {...this.windowInfo,
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height,
      realX: x!,
      realY: y!,
      realWidth: width,
      realHeight: height,
      windowState: this.state.windowState,
      realWindowState: this.state.boxEnumState
    };
    return (
      <Root
        overlapped={this.state.overlapped}
        ref={this.rootRef}
        x={x || 0}
        y={y || 0}
        data-scale={this.state.transformation.scale}
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
                    this._setWindowState(
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
                    this._setWindowState(WindowState.MAX);
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
                    this._setWindowState(WindowState.NORMAL);
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
                    this._setWindowState(WindowState.HIDE);
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
        <Client
          id="CLIENT"
          ref={this.clientRef}
          TitleSize={this.state.titleSize}
          Width={clientWidth}
          Height={clientHeight}
          style={this.props.clientStyle!}
          onWheel={this.onWheel.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
        >
          <div ref={this.zoomRef} style={{
            width: '100%',
            height: '100%',
            transformOrigin: `${this.state.transformation.originX}px ${this.state.transformation.originY}px`,
            transform: `matrix(${this.state.transformation.scale}, 0, 0, ${this.state.transformation.scale}, ${this.state.transformation.translateX}, ${this.state.transformation.translateY})`,
          }}>
            {this.props.children}
          </div>
        </Client>
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
    this.flagWindowState = true;
    this._setWindowState(state);
  }
  public _setWindowState(state: WindowState | undefined) {
    if (state) {
      this.setState({ windowState: state });
      this.windowInfo.windowState = state;
    }
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
            const act = activeNodes.has(node);
            //if(node._symbol.state.active !== act)
            Manager.callEvent(node, "active", act);
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
    const animation = () => {
      node.removeEventListener("animationend", animation);
      this.setState({ boxEnumState: WindowState.HIDE });
    };
    setTimeout(() => {
      node.addEventListener("animationend", animation);
      node.style.animation = "Hide 0.5s ease 0s forwards";
    }, 1);
  }
  private onMouseDown(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) {
    if (Manager.moveNode == null) {
      this.foreground();
      if (this.props.moveable || Manager.frame) {
        Manager.moveNode = this.rootRef.current;
        let p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent);
        Manager.baseX = p.x;
        Manager.baseY = p.y;
        Manager.nodeX = this.windowInfo.realX;
        Manager.nodeY = this.windowInfo.realY;
        Manager.nodeWidth = this.windowInfo.realWidth;
        Manager.nodeHeight = this.windowInfo.realHeight;
      }
    }
    e.stopPropagation();
  }
  //フレームクリックイベントの処理
  private onFrame(
    e:
      | React.TouchEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    if (Manager.frame == null) Manager.frame = e.currentTarget.id;
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
              (node as typeof node & { _symbol?: JSWindow })._symbol instanceof
              JSWindow
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
    }
  }

  private onParentSize() {
    if (this.resizeHandle) return;
    this.resizeHandle = setTimeout(() => {
      this.forceUpdate();
      this.resizeHandle = undefined;
    }, 10);
  }
  private getParentScale(): number {
    let scale = 1;
    let node: HTMLElement & { _symbol?: Symbol } | null = this.rootRef.current;
    if (node) {
      while ((node = node.parentNode as HTMLElement)) {
        if (node._symbol instanceof JSWindow) {
          scale = +(node?.dataset?.scale || 1);
          break;
        }
      }
    }

    return scale;
  }
  private onMove(e: MEvent): void {
    // if (WindowManager.frame == null) return;
    if (this.state.windowState === WindowState.MAX) return;
    let [px, py, pwidth, pheight] = [
      this.state.x === null ? this.windowInfo.realX : this.state.x,
      this.state.y === null ? this.windowInfo.realY : this.state.y,
      this.state.width,
      this.state.height
    ];
    let p = e.params as MovePoint;
    const parentScale = this.getParentScale();
    if (p.distance) {
      const vx =
        parentScale * Math.abs(Math.cos(p.radian!) * p.distance) * (p.distance < 0 ? -1 : 1);
      const vy =
        parentScale * Math.abs(-Math.sin(p.radian!) * p.distance) * (p.distance < 0 ? -1 : 1);

      px = p.nodePoint.x - vx / 2;
      py = p.nodePoint.y - vy / 2;
      pwidth = Manager.nodeWidth + vx;
      pheight = Manager.nodeHeight + vy;
    } else {
      //選択されている場所によって挙動を変える
      let frameIndex = Manager.frame || "";
      const deltaX = (p.nowPoint.x - p.basePoint.x) / parentScale;
      const deltaY = (p.nowPoint.y - p.basePoint.y) / parentScale;
      switch (frameIndex) {
        case "TOP":
          py = p.nodePoint.y + deltaY;
          pheight = Manager.nodeHeight - deltaY;
          break;
        case "RIGHT":
          pwidth = Manager.nodeWidth + deltaX;
          break;
        case "BOTTOM":
          pheight = Manager.nodeHeight + deltaY;
          break;
        case "LEFT":
          px = p.nodePoint.x + deltaX;
          pwidth = Manager.nodeWidth - deltaX;
          break;
        case "LEFT-TOP":
          px = p.nodePoint.x + deltaX;
          py = p.nodePoint.y + deltaY;
          pwidth = Manager.nodeWidth - deltaX;
          pheight = Manager.nodeHeight - deltaY;
          break;
        case "RIGHT-TOP":
          py = p.nodePoint.y + deltaY;
          pwidth = Manager.nodeWidth + deltaX;
          pheight = Manager.nodeHeight - deltaY;
          break;
        case "LEFT-BOTTOM":
          px = p.nodePoint.x + deltaX;
          pwidth = Manager.nodeWidth - deltaX;
          pheight = Manager.nodeHeight + deltaY;
          break;
        case "RIGHT-BOTTOM":
          pwidth = Manager.nodeWidth + deltaX;
          pheight = Manager.nodeHeight + deltaY;
          break;
        case "TITLE":
          px = p.nodePoint.x + deltaX;
          py = p.nodePoint.y + deltaY;
          break;
        default:
          //クライアント領域
          if (this.props.moveable) {
            px = p.nodePoint.x + deltaX;
            py = p.nodePoint.y + deltaY;
          } else return;
      }
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

    try {
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    } catch (e) {
      //
    }
  }

  private getTranslate(scale: number, minScale: number, maxScale: number) {
    return (pos: number, prevPos: number, translate: number) => {
      return (scale <= maxScale && scale >= minScale && pos !== prevPos)
        ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
        : translate;
    }
  }

  private getScale(scale: number, minScale: number, maxScale: number, zoomSensitivity: number, deltaScale: number) {
    let newScale: number = scale + (deltaScale / (zoomSensitivity / scale));
    newScale = Math.max(minScale, Math.min(newScale, maxScale));
    return [scale, newScale];
  }

  private panBy(x: number, y: number) {
    if (!this.props.workspace) return;
    this.setState((prevState) => ({ transformation: {
      ...prevState.transformation,
      translateX: prevState.transformation.translateX + x,
      translateY: prevState.transformation.translateY + y,
    }}));
  }

  private zoom(deltaScale: number, x: number, y: number) {
    if (!this.props.workspace) return;
    const zoomNode: HTMLElement | null = this.zoomRef.current;
    if (!zoomNode) return;

    const { left, top } = zoomNode.getBoundingClientRect();
    const { minScale, maxScale, zoomSensitivity } = this.props;
    const [scale, newScale] = this.getScale(this.state.transformation.scale!, minScale!, maxScale!, zoomSensitivity!, deltaScale);
    const originX = x - left;
    const originY = y - top;
    const newOriginX = originX / scale;
    const newOriginY = originY / scale;
    const translate = this.getTranslate(scale, minScale!, maxScale!);
    const translateX = translate(originX, this.state.transformation.originX, this.state.transformation.translateX);
    const translateY = translate(originY, this.state.transformation.originY, this.state.transformation.translateY);

    this.setState({ transformation: {
      originX: newOriginX,
      originY: newOriginY,
      translateX,
      translateY,
      scale: newScale,
    }});
  }

  private onWheel(evt: React.MouseEvent) {
    evt.stopPropagation();

    const e: any = evt.nativeEvent;
    if ((e.ctrlKey === true || e.altKey === true) && e.deltaY) {
      this.zoom(-Math.sign(e.deltaY), e.pageX, e.pageY);
    }
  }
  private onMouseMove(evt: React.MouseEvent) {
    const e: any = evt.nativeEvent;
    if (e.shiftKey === true) {
      this.panBy(e.movementX, e.movementY);
      evt.stopPropagation();
    }
  }
}
