import styled from "styled-components";
import React, { ReactNode, Component, RefObject, createRef } from "react";
import { Resize } from "./Resize";
import imgResize from "../../../images/resize.svg";
import { Manager, JWFEvent, MovePoint } from "../../lib/Manager";

interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  pos: number;
  size: number;
  children?: ReactNode | null;
  type: "ns" | "sn" | "we" | "ew";
  open: boolean;
  activeMode: boolean;
  procOpen: (open: boolean) => void;
  procMove:(pos: number) => void;
}
const BarStyle = styled.div.attrs<BarProps>(p => {
  let style = {};
  switch (p.type) {
    case "we":
      style = {
        top: 0,
        bottom: 0,
        left: p.pos + "px",
        right: null,
        width: p.size + "px",
        cursor: "ew-resize",
        paddingLeft: "2px"
      };
      break;
    case "ew":
      style = {
        top: 0,
        bottom: 0,
        right: p.pos + "px",
        left: null,
        width: p.size + "px",
        cursor: "ew-resize",
        paddingLeft: "2px"
      };
      break;
    case "ns":
      style = {
        left: 0,
        right: 0,
        top: p.pos + "px",
        bottom: null,
        height: p.size + "px",
        paddingTop: "px",
        cursor: "ns-resize"
      };
      break;
    case "sn":
      style = {
        left: 0,
        right: 0,
        top: null,
        bottom: p.pos + "px",
        height: p.size + "px",
        paddingTop: "px",
        cursor: "ns-resize"
      };
      break;
  }
  return { style };
})<BarProps>`
  position: absolute;
  overflow: visible;
  box-sizing: border-box;
  background-color: #777777;
  border: outset 2px #b8b7b7;
  user-select: none;
  vertical-align: middle;
`;

interface BarState {
  open: boolean;
  pos:number;
}
export class Bar extends Component<BarProps, BarState> {
  private barRef = createRef<HTMLDivElement>();
  constructor(props: BarProps) {
    super(props);
    this.state = { open: true,pos:props.pos };
  }
  render() {
    return (
      <BarStyle
        {...this.props}
        ref={this.barRef}
        onTouchStart={this.onMouseDown.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
      >
        {this.props.activeMode && (
          <Resize
            size={32}
            rot={this.props.type === "ns" || this.props.type === "sn"}
            src={imgResize}
            onClick={() => this.props.procOpen(!this.state.open)}
          />
        )}
      </BarStyle>
    );
  }
  public componentDidMount() {
    const node = this.barRef.current!;
    node.addEventListener("move", this.onMove.bind(this));
  }
  public componentWillUnmount() {
    const node = this.barRef.current!;
    node.removeEventListener("move", this.onMove.bind(this));
  }
  componentDidUpdate() {
    if (!this.props.open && this.state.open) {
      const node = this.barRef.current!;
      node.style.animation =
        this.props.type + "DrawerClose 0.5s ease 0s forwards";
      this.setState({ open: false });
    } else if (this.props.open && !this.state.open) {
      const node = this.barRef.current!;
      node.style.animation = this.props.type + "DrawerShow 0.5s ease 0s normal";
      this.setState({ open: true });
    }
  }
  protected onMove(e: JWFEvent) {
    let p = e.params as MovePoint;
    let pos = this.state.pos;
    switch (this.props.type!) {
      case "we":
        pos = p.nodePoint.x + (p.nowPoint.x - p.basePoint.x);
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
    this.props.procMove(pos);
    //this.closeBar();
  }
  protected onMouseDown(
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) {
    if (Manager.moveNode == null) {
      const node = this.barRef.current!;
      Manager.moveNode = node;
      let p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent);
      Manager.baseX = p.x;
      Manager.baseY = p.y;
      Manager.nodeX = this.state.pos;
      Manager.nodeY = this.state.pos;
      Manager.nodeWidth = node.offsetWidth;
      Manager.nodeHeight = node.offsetHeight;
    }
    this.props.procMove(this.state.pos);
  }
}
