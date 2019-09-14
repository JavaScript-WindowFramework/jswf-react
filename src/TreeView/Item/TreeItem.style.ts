import styled from "styled-components";

interface StyleProps {}

const lineSize = 1.6;

export const Root = styled.div.attrs<StyleProps>(p => ({
  style: {}
}))<StyleProps>`
  position: relative;

  #icon {
    cursor: pointer;
    box-sizing: border-box;
    margin: ${lineSize * 0.2}em;
    width: ${lineSize * 0.8}em;
  }
  #item {
    border-radius: 4px;
    cursor: default;
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    &:hover {
      background-color: rgba(200, 230, 250, 0.4);
    }
    &.select {
      background-color: rgba(100, 150, 250, 0.4);
      &:hover {
        background-color: rgba(100, 150, 250, 0.5);
      }
    }
  }
  #label {
    flex: 1;
    flex-wrap: nowrap;
    word-break: break-all;
    margin: 0.1em;
  }
  #child {
    position: relative;
    > div {
      display: flex;
    }
  }
  #children {
    flex: 1;
  }
  #line {
    width: ${lineSize / 2}em;
    margin-right: ${lineSize / 2}em;
    bottom: 0;
    flex-grow: 0;
    flex-shrink: 0;
    border-right: solid 1px;
  }

  .close {
    > div {
      animation: treeClose 0.5s ease 0s forwards;
    }
  }
  .open {
    > div {
      animation: treeOpen 0.1s ease 0s normal;
    }
  }

  @keyframes treeOpen {
    0% {
      margin-top: -100%;
    }

    100% {
      margin-top: 0%;
    }
  }

  @keyframes treeClose {
    0% {
      height: auto;
      margin-top: 0;
    }

    100% {
      margin-top: -100%;
    }
  }
`;
