import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Root } from "./Root";
import { Header } from "./Header";

interface HeadersProps {
  onSize: (headers: number[]) => void;
  onClick: (index: number) => void;
  children: ReactNode;
  clientWidth?: number;
}
/**
 *ListViewヘッダー管理クラス
 *
 * @export
 * @class Headers
 * @extends {Component<HeadersProps>}
 */
export class Headers extends Component<HeadersProps> {
  private headers: RefObject<Header>[] = [];
  private values: ReactNode[] = [];
  private rootRef = createRef<HTMLDivElement>();
  public componentDidMount() {
    this.values = React.Children.toArray(this.props.children);
    this.onSize();
  }
  public componentDidUpdate() {
    const clientWidth = this.props.clientWidth;
    if (this.props.clientWidth !== undefined) {
      const width = this.headers.reduce((a, b) => {
        const w = b.current!.getWidth();
        if (w < 0) a = -9999999;
        return a - b.current!.getWidth();
      }, clientWidth!);

      const index = this.headers.length - 1;
      if (index >= 0) {
        const header = this.headers[index].current!;
        let tempWidth = header.getTempWidth() + width;
        if (tempWidth < 0) tempWidth = 0;
        if (header.state.tempWidth !== tempWidth) {
          header.setState({ tempWidth });
        }
      }
    }
  }
  public render() {
    this.headers = [];
    return (
      <Root ref={this.rootRef}>
        {this.values.map((element: ReactNode, index) => {
          const refHeader = createRef<Header>();
          this.headers.push(refHeader);
          return (
            <Header
              key={index}
              ref={refHeader}
              onClick={() => {
                this.onClick(index);
              }}
              onSize={() => this.onSize()}
            >
              {element}
            </Header>
          );
        })}
      </Root>
    );
  }
  protected onSize() {
    const headerSizes = this.headers.map(headerRef => {
      if (headerRef.current) return headerRef.current.getWidth();
      return -1;
    });
    if (headerSizes.indexOf(-1) === -1) this.props.onSize(headerSizes);
  }
  protected onClick(index: number) {
    this.props.onClick(index);
  }
  public getHeader(index: number) {
    return this.headers[index];
  }
  public getTypes() {
    return this.headers.map(header => {
      return header.current!.getType();
    });
  }
}
