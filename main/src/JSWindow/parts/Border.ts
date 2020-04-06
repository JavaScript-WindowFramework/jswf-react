import styled from "styled-components";

export const Border = styled.div<{ Size: number }>`
  position: absolute;
  user-select: none;
  &:active{
    background-color:rgba(0,0,0,0.05);
  }
  &#TOP {
    cursor: n-resize;
    left: 0px;
    top: -${p => p.Size}px;
    right: 0px;
    height: ${p => p.Size}px;
  }
  &#RIGHT {
    cursor: e-resize;
    top: 0px;
    right: -${p => p.Size}px;
    bottom: 0px;
    width: ${p => p.Size}px;
  }
  &#BOTTOM {
    cursor: s-resize;
    left: 0px;
    right: 0px;
    height: ${p => p.Size}px;
    bottom: -${p => p.Size}px;
  }
  &#LEFT {
    cursor: w-resize;
    top: 0px;
    left: -${p => p.Size}px;
    bottom: 0px;
    width: ${p => p.Size}px;
  }
  &#LEFT-TOP {
    cursor: nw-resize;
    left: -${p => p.Size}px;
    top: -${p => p.Size}px;
    width: ${p => p.Size}px;
    height: ${p => p.Size}px;
  }
  &#RIGHT-TOP {
    cursor: ne-resize;
    right: -${p => p.Size}px;
    top: -${p => p.Size}px;
    width: ${p => p.Size}px;
    height: ${p => p.Size}px;
  }
  &#LEFT-BOTTOM {
    cursor: sw-resize;
    left: -${p => p.Size}px;
    bottom: -${p => p.Size}px;
    width: ${p => p.Size}px;
    height: ${p => p.Size}px;
  }
  &#RIGHT-BOTTOM {
    cursor: se-resize;
    right: -${p => p.Size}px;
    bottom: -${p => p.Size}px;
    width: ${p => p.Size}px;
    height: ${p => p.Size}px;
  }
`;
export const borders = [
  "TOP",
  "RIGHT",
  "BOTTOM",
  "LEFT",
  "LEFT-TOP",
  "RIGHT-TOP",
  "LEFT-BOTTOM",
  "RIGHT-BOTTOM"
];