import styled from "styled-components";

interface StyleProps {}

export const Root = styled.div.attrs<StyleProps>(p => ({
  style: {}
}))<StyleProps>`
  user-select:none;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow:auto;

`;
