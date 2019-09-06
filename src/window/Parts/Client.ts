import styled from "styled-components";

interface ClientState {
  TitleSize: number, Width: number, Height: number
}

export const Clinet = styled.div.attrs<ClientState>(p => ({
  style: {
    top: p.TitleSize + "px",
    width: p.Width + "px",
    height: p.Height + "px"
  }
})) <ClientState>`
  background: whitesmoke;
  position: absolute;
  overflow: hidden;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;
