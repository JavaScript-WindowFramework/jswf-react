import { ReactNode } from "react";
import styled from "styled-components";

interface StyleProps {
  size: number;
  rot: boolean;
}

export const Resize = styled.img.attrs<StyleProps>(p => {
  let style = {};
  if (p.rot) {
    style =  {
      transform:"rotate(90deg)"
    }
    return { style };
  }
})<StyleProps>`
  & {
    position: relative;
    width: ${p => p.size}px;
    height: ${p => p.size}px;
    margin-top: -${p => p.size / 2 + 2}px;
    margin-left: -${p => p.size / 2 + 2}px;
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
