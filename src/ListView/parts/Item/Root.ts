import styled from "styled-components";

interface StyleProps {
  left: number;
}
export const Root = styled.div.attrs<StyleProps>(p => ({
  style: { left: p.left + "px" }
}))<StyleProps>`
  position: relative;
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
  cursor: default
`;
