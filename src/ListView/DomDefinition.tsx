import React, { ReactNode, ReactElement, Component } from "react";

export interface ListRowProps {
  value?:unknown;
  children?: ReactNode;
}
export class ListRow extends Component<ListRowProps>{}

export interface ListHeadersProps {
  children?: ReactElement<typeof ListHeader>[];
}
export class ListHeaders extends Component<ListHeadersProps> {}

export interface ListHeaderProps {
  type?:string;
  width?:number;
  children?: ReactNode;
}
export class ListHeader extends Component<ListHeaderProps>{}

export interface ListItemProps {
  value?:unknown
  children?: ReactNode;
}
export class ListItem extends Component<ListItemProps> {}