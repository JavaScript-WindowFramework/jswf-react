import React, { Component, ReactNode, ReactElement, createRef } from "react";
import { Root } from "./parts/Root";
import { Headers } from "./parts/Header/Headers";
import { Items } from "./parts/Item/Items";

interface Props {
  children?: ReactNode;
  onItemClick?: (row: number, col: number) => void;
  onItemDoubleClick?: (row: number, col: number) => void;
}
interface State {
  xScroll: number;
  headerSizes: number[];
  sortIndex?: number;
  sortOrder?: boolean;
  sortType?: string;
  selectItems: Set<number>;
}
export class ListView extends Component<Props, State> {
  static defaultProps = { children: [] };
  state: State = {
    xScroll: 0,
    headerSizes: [],
    sortIndex: -1,
    selectItems: new Set()
  };
  rootRef = createRef<HTMLDivElement>();
  itemsRef = createRef<Items>();
  headersRef = createRef<Headers>();

  render() {
    const children = React.Children.toArray(
      this.props.children
    ) as React.ReactElement[];
    let headers: ReactElement[] = [];
    let items: ReactElement[] = [];
    if (children[0] && children[0].props.children)
      headers = children[0].props.children as ReactElement[];
    if (children[1] && children[1].props.children) items = children.slice(1);

    return (
      <Root
        ref={this.rootRef}
        onScroll={e => {
          this.setState({ xScroll: this.rootRef.current!.scrollLeft });
        }}
      >
        <Headers
          ref={this.headersRef}
          onClick={this.onHeaderClick.bind(this)}
          onSize={headerSizes => this.setState({ headerSizes })}
        >
          {headers}
        </Headers>
        <Items
          ref={this.itemsRef}
          headerTypes={this.headersRef.current?this.headersRef.current!.getTypes():[]}
          selectItems={this.state.selectItems}
          sortIndex={this.state.sortIndex}
          sortOrder={this.state.sortOrder}
          sortType={this.state.sortType}
          xScroll={this.state.xScroll}
          headerSizes={this.state.headerSizes}
          onClick={this.onItemClick.bind(this)}
          onDoubleClick={this.onItemDoubleClick.bind(this)}
        >
          {items}
        </Items>
      </Root>
    );
  }
  onHeaderClick(sortIndex: number) {
    let sortOrder;
    if (this.state.sortIndex === sortIndex) {
      sortOrder = !this.state.sortOrder;
    } else {
      sortOrder = true;
    }
    const sortType = this.headersRef
      .current!.getHeader(sortIndex)
      .current!.getType();
    this.setState({ sortOrder, sortIndex, sortType });
  }
  onItemClick(e: React.MouseEvent, row: number, col: number) {
    const selectItems = this.state.selectItems;
    if (e.ctrlKey) {
      if (!selectItems.has(row)) selectItems.add(row);
      else selectItems.delete(row);
    } else if (e.shiftKey) {
      this.state.selectItems.add(row);
      const items = Array.from(selectItems.values());
      let s = Math.min.apply(null, items);
      let e = Math.max.apply(null, items);
      for (let i = s; i <= e; i++) selectItems.add(i);
    } else {
      selectItems.clear();
      selectItems.add(row);
    }

    this.state.selectItems.add(row);
    this.setState({ selectItems: new Set(selectItems.values()) });

    if (this.props.onItemClick) {
      this.props.onItemClick(row, col);
    }
  }
  onItemDoubleClick(e: React.MouseEvent, row: number, col: number) {
    if (this.props.onItemDoubleClick) {
      this.props.onItemDoubleClick(row, col);
    }
  }
  getSelectItem() {
    const selectItems = this.state.selectItems;
    if (selectItems.size) return selectItems.values().next();
    return -1;
  }
  getSelectItems() {
    return Array.from(this.state.selectItems.values());
  }
  getItem(row: number, col: number): React.ReactNode | undefined {
    const itemValues = this.itemsRef.current!.getItemValues();
    if (row >= itemValues.length) return undefined;
    return itemValues[row][col];
  }
  getRows() {
    return this.itemsRef.current!.getItemValues().length;
  }
  getCols() {
    return this.state.headerSizes.length;
  }
  addItem(item: ReactNode[]) {
    this.itemsRef.current!.addItem(item);
  }
  removeItem(row: number) {
    this.itemsRef.current!.removeItem(row);
    this.state.selectItems.clear();
  }
}
