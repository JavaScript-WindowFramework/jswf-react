import styled from "styled-components";
import { ReactNode } from "react";

export interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  pos: number;
  size: number;
  children?: ReactNode | null;
  type: "ns" | "sn" | "we" | "ew";
  open: boolean;
  activeMode: boolean;
  procOpen: (open: boolean) => void;
  procMove: (pos: number) => void;
}
export const BarStyle = styled.div.attrs<BarProps>((p) => {
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
        paddingLeft: "2px",
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
        paddingLeft: "2px",
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
        cursor: "ns-resize",
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
        cursor: "ns-resize",
      };
      break;
  }
  return { style };
})<BarProps>`
  position: absolute;
  overflow: visible;
  box-sizing: border-box;
  background-color: #bbbbbb;
  border: outset 2px #b8b7b7;
  user-select: none;
  vertical-align: middle;
  &:active {
    background-color: #cccccc;
  }
`;
