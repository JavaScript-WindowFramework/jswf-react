import { ReactNode } from "react";
import styled from "styled-components";

interface StyleProps {
  barSize: number;
  size: number;
  barOpen: boolean;
  type: string;
}

export const Resize = styled.img.attrs<StyleProps>(p => {
  let style: React.CSSProperties = {};
  if (p.type === "ns" || p.type === "sn") {
    style.transform = "rotate(90deg)";
  }
  if (!p.barOpen) {
    switch (p.type) {
      case "we":
        style.marginLeft = -(p.size -p.barSize)/2+ "px";
        break;
      case "ew":
        style.marginLeft = -(p.size +p.barSize)/2+ "px";
        break;
      case "ns":
        style.marginTop = -(p.size -p.barSize)/2+ "px";
        break;
      case "sn":
        style.marginTop = -(p.size +p.barSize)/2+ "px";
        break;
    }
  }
  return { style };
})<StyleProps>`
  & {
    position: absolute;
    box-sizing:border-box;
    width: ${p => p.size}px;
    height: ${p => p.size}px;
    margin-top: -${p => p.size / 2}px;
    margin-left: -${p => p.size / 2}px;
    top: 50%;
    left: 50%;
    cursor: pointer;
    overflow: visible;
    background-color: rgba(255, 255, 255, 0.8);
    border: solid 1px rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    &:hover {
      background-color: rgba(200, 200, 255, 0.8);
    }
  }
`;
