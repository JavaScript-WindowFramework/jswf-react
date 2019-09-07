import styled from "styled-components";
import React, { ReactNode, Component, RefObject } from "react";
import { Resize } from "./Resize";
import imgResize from "../../../images/resize.svg";

interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  pos: number;
  size: number;
  children?: ReactNode | null;
  type: "ns" | "sn" | "we" | "ew";
  refs: RefObject<HTMLDivElement>;
  open: boolean;
  activeMode:boolean;
  procOpen:(open:boolean)=>void
}
const BarStyle = styled.div.attrs<BarProps>(p => {
  let style = {};
  switch (p.type) {
    case "we":
      style = {
        top: 0,
        bottom: 0,
        right: null,
        left: p.pos + "px",
        width: p.size + "px",
        cursor: "ew-resize",
        paddingLeft: "2px"
      };
      break;
    case "ew":
      style = {
        top: 0,
        bottom: 0,
        left: null,
        right: p.pos + "px",
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
}
export class Bar extends Component<BarProps, BarState> {
  constructor(props: BarProps) {
    super(props);
    this.state = { open: true };
  }
  componentDidUpdate() {
    if(!this.props.open && this.state.open){
      const node = this.props.refs.current!;
      node.style.animation = this.props.type + "DrawerClose 0.5s ease 0s forwards";
      this.setState({open:false});
    }else if(this.props.open && !this.state.open){
      const node = this.props.refs.current!;
      node.style.animation = this.props.type + "DrawerShow 0.5s ease 0s forwards";
      this.setState({open:true});
    }
  }
  render() {
    return (
      <BarStyle {...this.props} ref={this.props.refs}>
        {this.props.activeMode && <Resize size={32} src={imgResize} onClick={()=>this.props.procOpen(!this.state.open)}/>}
      </BarStyle>
    );
  }

}
