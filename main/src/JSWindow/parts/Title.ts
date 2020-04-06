import styled from "styled-components";

import imageMin from "../../../images/min.svg";
import imageMax from "../../../images/max.svg";
import imageClose from "../../../images/close.svg";
import imageNormal from "../../../images/normal.svg";

export const Title = styled.div.attrs<{ Active: boolean }>(p => ({
  style: {
    backgroundColor: p.Active ? "rgba(50,100,255,0.9)" : "rgba(100,150,255,0.9)",
    color: p.Active ? "white" : "#eeeeee"
  }
}))<{ Active: boolean; Size: number }>`
user-select: none;
display: flex;
position: absolute;
cursor: move;
overflow: hidden;
border-left: 0.5px solid rgba(0, 0, 0, 0.4);
border-right: 0.5px solid rgba(0, 0, 0, 0.4);
border-top: 0.5px solid rgba(0, 0, 0, 0.4);
box-sizing: border-box;
border-radius: 0.8em 0.8em 0 0;

left: -1px;
top: -1px;
right: -1px;
height: ${p => (p.Size ? p.Size + 1 : 0)}px;

> #text {
  flex: 1;
  overflow: hidden;
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
  font-size: 24px;
  padding: 0px 0.5em;
  align-items: center;
  display: flex;
  white-space: nowrap;
}
> #icons {
  > div {
    display: inline-block;
    cursor: default;
    margin: 0.1em;
    background-size: 100% 100%;
    background-color: rgba(255, 255, 255, 0.05);
    width: ${p => p.Size - 2}px;
    height: ${p => p.Size - 2}px;
    &:hover{
      background-color: rgba(255, 255, 255, 0.2);
    }
    &#min {
      background-image: url(${imageMin});
    }
    &#max {
      background-image: url(${imageMax});
    }
    &#normal {
      background-image: url(${imageNormal});
    }
    &#close {
      background-image: url(${imageClose});
    }
  }
}
`;
