import React, { Component, createRef, ReactElement } from "react";
import { TreeItem } from "./Item/TreeItem";
import { Root } from "./Root";

interface Props {
  onItemClick?: (item: TreeItem) => void;
  onItemDoubleClick?: (item: TreeItem) => void;
}
interface State {}

export class TreeView extends Component<Props, State> {
  rootItemRef = createRef<TreeItem>();
  select: TreeItem | null = null;
  render() {
    const rootItem = this.props.children as ReactElement;
    if (rootItem && rootItem.type === TreeItem) {
      //TreeItemを再定義
      return (
        <Root>
          <TreeItem
            {...rootItem.props}
            ref={this.rootItemRef}
            treeView={this}
          ></TreeItem>
        </Root>
      );
    } else {
      //データが存在しなかった場合は、デフォルトでrootアイテムを用意
      return (
        <Root>
          <TreeItem
            ref={this.rootItemRef}
            label="Root"
            treeView={this}
          ></TreeItem>
        </Root>
      );
    }
  }
  getItem(): TreeItem {
    return this.rootItemRef.current!;
  }
  findItem(value: unknown) {
    return this.rootItemRef.current!.findItem(value);
  }
  findItems(value: unknown) {
    return this.rootItemRef.current!.findItems(value);
  }
  delItem(item: TreeItem) {
    return this.rootItemRef.current!.delItem(item);
  }
  getSelectItem(): TreeItem | null {
    return this.select;
  }
  selectItem(item: TreeItem | null) {
    if (this.select) this.select.onSelect(false);
    if (item) item.onSelect(true);
    this.select = item;
  }
  getCheckItems(){
    return this.rootItemRef.current!.getCheckItems();
  }
}
