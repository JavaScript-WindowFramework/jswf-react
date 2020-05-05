import styled from "styled-components";

interface StyleProps {}

export const Root = styled.div.attrs<StyleProps>(() => ({
  style: {}
}))<StyleProps>`
  user-select:none;
  position: relative;
  width: 100%;
  height: 100%;
  overflow:auto;

`;
