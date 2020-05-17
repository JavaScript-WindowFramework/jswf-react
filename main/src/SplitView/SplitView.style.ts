import styled from "styled-components";


export const Root = styled.div`
  & {
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  @keyframes nsDrawerShow {
    0% {
      top: 0;
      transform: translateY(-100%);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes nsDrawerClose {
    0% {
      transform: translateY(0);
    }

    100% {
      top: 0;
      transform: translateY(-100%);
    }
  }

  @keyframes snDrawerShow {
    0% {
      bottom: 0;
      transform: translateY(100%);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes snDrawerClose {
    0% {
      transform: translateY(0);
    }

    100% {
      bottom: 0;
      transform: translateY(100%);
    }
  }

  @keyframes weDrawerShow {
    0% {
      left: 0;
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(0);
    }
  }

  @keyframes weDrawerClose {
    0% {
      transform: translateX(0);
    }

    100% {
      left: 0;
      transform: translateX(-100%);
    }
  }

  @keyframes ewDrawerShow {
    0% {
      transform: translateX(100%);
      right: 0;
    }

    100% {
      transform: translateX(0);
    }
  }

  @keyframes ewDrawerClose {
    0% {
      transform: translateX(0);
    }

    100% {
      right: 0;
      transform: translateX(100%);
    }
  }

  @keyframes DrawerMax {
    0% {
    }

    100% {
      right: 0;
      left: 0;
      top: 0;
      bottom: 0;
    }
  }
  @keyframes DrawerNormal {
    0% {
      right: 0;
      left: 0;
      top: 0;
      bottom: 0;
    }

    100% {
    }
  }
`;
