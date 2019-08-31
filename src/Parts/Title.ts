import styled from "styled-components";

import imageMin from "../../images/min.svg";
import imageMax from "../../images/max.svg";
import imageClose from "../../images/close.svg";
import imageNormal from "../../images/normal.svg";


export const Title = styled.div.attrs<{ Active: boolean }>(p => ({
  style: {
    backgroundColor: p.Active ? "#6688ff" : "#aabbee",
    color: p.Active ? "white" : "black"
  }
}))<{ Active: boolean; Size: number }>`
  user-select: none;
  display: flex;
  position: absolute;
  cursor: move;
  overflow: hidden;

  left: -1px;
  top: -1px;
  right: -1px;
  height: ${p => p.Size?p.Size+1:0}px;

  > #text {
    flex: 1;
    overflow: hidden;
    font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
      "Lucida Sans", Arial, sans-serif;
    padding: 0px 0.5em;
    align-items: center;
    display: flex;
    white-space: nowrap;
  }
  > #icons {
    > div {
      display: inline-block;
      cursor: default;
      background-size: 100% 100%;
      width: ${p => p.Size-2}px;
      height: ${p => p.Size-2}px;
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