import styled from "styled-components";
interface StyleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  overlapped: boolean;
  titleSize: number;
  frame:boolean;
}
export const Root = styled.div.attrs<StyleProps>(p => ({
  style: {
    left: p.x + "px",
    top: p.y + "px",
    width: p.width + "px",
    height: p.height + "px",
    position: p.overlapped ? "fixed" : "absolute"
  }
})) <StyleProps>`
  visibility :hidden;
  position: fixed;
  ${p => p.frame && "border: solid 1.0px rgba(0, 0, 0, 0.4);"}
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);

  @keyframes Show {
    0% {
      opacity: 0;
      transform: scale(0);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes Hide {
    100% {
      opacity: 0;
      transform: scale(0);
    }

    0% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes Max {
    0% {
      transform: scale(0.5);
    }

    100% {
      transform: scale(1);
    }
  }
  @keyframes Restore {
    0% {
      transform: scale(1.5);
    }

    100% {
      transform: scale(1);
    }
  }
  @keyframes MinRoot {
    100% {
      height: ${p => p.titleSize}px;
    }
  }

  @keyframes MinClient {
    100% {
      height: 0px;
    }
  }
  @keyframes MinRestoreClient {
    0% {
      max-height: 0px;
    }
    100% {
      max-height: 100%;
    }
  }
  @keyframes MinRestoreRoot {
    0% {
      max-height: ${p => p.titleSize}px;
    }
    100% {
      max-height: 100%;
    }
  }
`;