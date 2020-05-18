import React, { Component, createRef, ReactNode } from "react";
import { TreeItem } from "./Item/TreeItem";
import { Root } from "./TreeView.style";
import { Manager } from "@jswf/manager";

interface Props {
  children?: ReactNode;
  itemStyle?: number;
  userSelect?: boolean;
  onExpand?: (item: TreeItem, expand: boolean, first: boolean) => void;
  onItemClick?: (item: TreeItem) => void;
  onItemDoubleClick?: (item: TreeItem) => void;
}
export const ItemDataDefault = {
  itemStyle: 0,
  label: "",
  value: undefined,
  expand: true,
  select: false,
  checked: false,
  keys: {},
  children: [],
};

export var UniqueKey = { value: 1 };
/**
 *TreeViewクラス
 *
 * @export
 * @class TreeView
 * @extends {Component<Props, State>}
 */
export class TreeView extends Component<Props> {
  private rootItemRef = createRef<TreeItem>();
  private select: TreeItem | null = null;

  public constructor(props: Props) {
    super(props);
  }
  public render() {
    return (
      <Root>
        {React.Children.map(
          this.props.children,
          (item) =>
            typeof item === "object" &&
            item &&
            "type" in item &&
            item.type === TreeItem && (
              <TreeItem
                ref={this.rootItemRef}
                {...item.props}
                treeView={this}
              />
            )
        )}
      </Root>
    );
  }
  public componentDidMount() {
    Manager.init();
  }

  /**
   *Rootアイテムを返す
   *
   * @returns {TreeItem}
   * @memberof TreeView
   */
  public getItem(): TreeItem {
    return this.rootItemRef.current!;
  }
  /**
   *該当する値を持つアイテムを一つ返す
   *
   * @param {unknown} value
   * @returns {(TreeItem | null)}
   * @memberof TreeView
   */
  public findItem(value: unknown): TreeItem | null {
    return this.rootItemRef.current!.findItem(value);
  }
  /**
   *該当する値を持つアイテムを複数返す
   *
   * @param {unknown} value
   * @returns {TreeItem[]}
   * @memberof TreeView
   */
  public findItems(value: unknown): TreeItem[] {
    return this.rootItemRef.current!.findItems(value);
  }
  /**
   *アイテムを削除する
   *
   * @param {TreeItem} item
   * @returns {boolean}
   * @memberof TreeView
   */
  public delItem(item: TreeItem): boolean {
    return this.rootItemRef.current!.delItem(item);
  }
  /**
   *選択中のアイテムを返す
   *
   * @returns {(TreeItem | null)}
   * @memberof TreeView
   */
  public getSelectItem(): TreeItem | null {
    return this.select;
  }
  /**
   *アイテムを選択する
   *
   * @param {(TreeItem | null)} item
   * @memberof TreeView
   */
  public selectItem(item: TreeItem | null): void {
    if (this.select) this.select.onSelect(false);
    this.select = item;
    if (item) item.onSelect(true);
  }
  /**
   *チェック中のアイテムを複数返す
   *
   * @returns {TreeItem[]}
   * @memberof TreeView
   */
  public getCheckItems(): TreeItem[] {
    return this.rootItemRef.current!.getCheckItems();
  }
  // public getRootUniqueKey() {
  //   return this.item.uniqueKey;
  // }
}
