import styled from "styled-components";

interface StyleProps {}
export const Root = styled.div.attrs<StyleProps>(() => ({
  style: {}
}))<StyleProps>`
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
