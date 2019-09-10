import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Root } from "./Root";
import { Header } from "./Header";

interface HeadersProps {
  onSize: (headers: number[]) => void;
  onClick: (index: number) => void;
  children: ReactNode;
}
export class Headers extends Component<HeadersProps> {
  headers: RefObject<Header>[] = [];
  values:ReactNode[] = [];
  componentDidMount() {
    this.values = React.Children.toArray(this.props.children);
    this.onSize();
  }
  componentDidUpdate(){
    const headerWidth = this.rootRef.current!.offsetWidth;
    const width = this.headers.reduce((a,b)=>{
      return a-b.current!.getWidth();
    },this.rootRef.current!.offsetWidth);
    console.log(headerWidth);
    const index = this.headers.length -1;
    if(index >= 0 && width){
      const header = this.headers[index].current!;
      header.setState({width:header.getWidth()+width},()=>{ this.onSize();});

    }
  }
  rootRef = createRef<HTMLDivElement>();
  render() {
    this.headers = [];
    return (
      <Root ref={this.rootRef}>
        {this.values.map(
          (element: ReactNode, index) => {
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
          }
        )}
      </Root>
    );
  }
  onSize() {
    const headerSizes = this.headers.map(headerRef => {
      if (headerRef.current) return headerRef.current.getWidth();
      return -1;
    });
    if (headerSizes.indexOf(-1) === -1) this.props.onSize(headerSizes);
  }
  onClick(index: number) {
    this.props.onClick(index);
  }
  getHeader(index: number) {
    return this.headers[index];
  }
  getTypes() {
    return this.headers.map(header => {
      return header.current!.getType();
    });
  }
}
