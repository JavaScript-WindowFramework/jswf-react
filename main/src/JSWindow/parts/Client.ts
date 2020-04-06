import styled from "styled-components";

interface ClientState {
  TitleSize: number, Width: number, Height: number
}

export const Client = styled.div.attrs<ClientState>(p => ({
  style: {
    top: p.TitleSize + "px",
    width: p.Width + "px",
    height: p.Height + "px"
  }
})) <ClientState>`
  background: whitesmoke;
  position: absolute;
  overflow: hidden;
  right: 0;
  left: 0;
  top:0;
  bottom: 0;
  width:0;
  height:0;
`;
