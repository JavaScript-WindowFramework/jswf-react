import styled from "styled-components";

interface ItemProps {
  widthPos: string;
}
export const Item = styled.div.attrs<ItemProps>(p => ({
  style: { justifyContent: p.widthPos }
}))<ItemProps>`
  display: flex;
  align-items: center;
  min-height: 1.5em;
  box-sizing: border-box;
  padding: 0.1em;
  overflow: hidden;
  user-select: none;
  border-bottom: solid 1px rgba(0, 0, 0, 0.4);
  border-left: solid 1px rgba(0, 0, 0, 0.1);
  &:nth-child(odd) {
    background-color: rgba(63, 164, 201, 0.2);
  }
  &:nth-child(even) {
    background-color: rgba(63, 201, 183, 0.2);
  }

  &.Hover {
    &:nth-child(odd) {
      background-color: rgba(63, 164, 201, 0.3);
    }
    &:nth-child(even) {
      background-color: rgba(63, 201, 183, 0.3);
    }
  }
  &.Select {
    &:nth-child(odd) {
      background-color: rgba(64, 160, 250, 0.5);
    }

    &:nth-child(even) {
      background-color: rgba(64, 170, 250, 0.5);
    }

    &.Hover {
      &:nth-child(odd) {
        background-color: rgba(64, 160, 250, 0.6);
      }

      &:nth-child(even) {
        background-color: rgba(64, 170, 250, 0.6);
      }
    }
  }
`;
