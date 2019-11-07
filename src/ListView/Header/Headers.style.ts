import styled from "styled-components";

interface RootProps {}
export const Root = styled.div.attrs<RootProps>(p => ({
  style: {}
}))<RootProps>`
  position: relative;
  display: flex;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  box-sizing: border-box;
  min-width: 100%;
  background-image: linear-gradient(
    180deg,
    rgb(144, 197, 240) 0%,
    rgb(63, 164, 201) 50%,
    rgb(100, 122, 221) 100%
  );
  > div {
    #back {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-image: linear-gradient(
        180deg,
        rgb(144, 197, 240) 0%,
        rgb(63, 164, 201) 50%,
        rgb(100, 122, 221) 100%
      );
      &:hover {
        background-image: linear-gradient(
          90deg,
          rgb(144, 197, 240) 0%,
          rgb(63, 164, 201) 50%,
          rgb(100, 122, 221) 100%
        );
      }
      &:active {
        background-image: linear-gradient(
          0deg,
          rgb(144, 197, 240) 0%,
          rgb(63, 164, 201) 50%,
          rgb(100, 122, 221) 100%
        );
      }
    }
    #label {
      padding: 0.1em;
      color: white;
      font-weight: bold;
    }

    position: relative;
    box-sizing: border-box;
    border-right: solid 1px;
    flex-grow: 0;
    flex-shrink: 0;
    > #slider {
      pointer-events: auto;
      z-index: 10;
      cursor: ew-resize;
      position: absolute;
      top: 0px;
      right: -16px;
      width: 32px;
      height: 100%;
      // background-color: rgba(255, 255, 255, 0.4);
    }
    &:last-child {
      > #slider {
        right: 0;
        width: 16px;
      }
    }
  }
`;
