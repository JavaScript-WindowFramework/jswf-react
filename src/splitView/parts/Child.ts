import { ReactNode } from "react";
import styled from "styled-components";

interface StyleProps {
}

export const Child = styled.div.attrs<StyleProps>(p => ({
  style: {
  }
})) <StyleProps>`
& {
  position:absolute;
  overflow:hidden;
  background-color: rgba(255,255,255,0.8);
}
  `