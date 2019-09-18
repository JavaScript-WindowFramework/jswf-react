import styled from "styled-components";

interface StyleProps {}

export const Child = styled.div.attrs<StyleProps>(p => ({
  style: {}
}))<StyleProps>`
  & {
    position: absolute;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.8);
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    width: atuo;
    height: atuo;
  }
`;
