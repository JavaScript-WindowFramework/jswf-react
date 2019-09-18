import styled from "styled-components";

interface StyleProps {}
export const Root = styled.div.attrs<StyleProps>(p => ({
  style: {}
}))<StyleProps>`
  position: absolute;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
