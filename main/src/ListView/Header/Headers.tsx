import React, { Component, createRef, RefObject, ReactElement } from "react";
import { Root } from "./Headers.style";
import { Header } from "./Header";
import { ListHeader, ListHeaderProps } from "../ExportDefinition";

interface HeadersProps {
  onSize: (headers: number[]) => void;
  onClick: (index: number) => void;
  children: ReactElement<typeof ListHeader>[];
  clientWidth?: number;
}
/**
 *ListViewヘッダー管理クラス
 *
 * @export
 * @class Headers
 * @extends {Component<HeadersProps>}
 */
export class HeaderArea extends Component<HeadersProps> {
  private headersRef: RefObject<Header>[] = [];
  private values: ListHeaderProps[] = [];
  private rootRef = createRef<HTMLDivElement>();
  public componentDidMount() {
    this.values = this.props.children
      .filter((header) => {
        return header.type === ListHeader.prototype.constructor;
      })
      .map((header) => header.props) as ListHeaderProps[];
    this.onSize();
  }
  public componentDidUpdate() {
    const clientWidth = this.props.clientWidth;
    if (this.props.clientWidth !== undefined) {
      const width = this.headersRef.reduce((a, b) => {
        const w = b.current!.getWidth();
        if (w < 0) a = -9999999;
        return a - b.current!.getWidth();
      }, clientWidth!);

      const index = this.headersRef.length - 1;
      if (index >= 0) {
        const header = this.headersRef[index].current!;
        let tempWidth = header.getTempWidth() + width;
        if (tempWidth < 0) tempWidth = 0;
        if (header.state.tempWidth !== tempWidth) {
          header.setState({ tempWidth });
        }
      }
    }
  }
  public render() {
    this.headersRef = [];
    return (
      <Root ref={this.rootRef}>
        {this.values.map((header, index) => {
          const refHeader = createRef<Header>();
          this.headersRef.push(refHeader);
          return (
            <Header
              key={index}
              ref={refHeader}
              type={header.type as "string" | "number"}
              width={header.width}
              onClick={() => {
                this.onClick(index);
              }}
              onSize={() => this.onSize()}
            >
              {header.children}
            </Header>
          );
        })}
      </Root>
    );
  }
  protected onSize() {
    const headerSizes = this.headersRef.map((headerRef) => {
      if (headerRef.current) return headerRef.current.getWidth();
      return -1;
    });
    if (headerSizes.indexOf(-1) === -1) {
      this.props.onSize(headerSizes);
    }
  }
  protected onClick(index: number) {
    this.props.onClick(index);
  }
  public getHeader(index: number) {
    return this.headersRef[index];
  }
  public getTypes() {
    return this.headersRef.map((header) => {
      return header.current!.getType();
    });
  }
}
