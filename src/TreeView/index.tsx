import React, { Component, createRef, ReactElement, ReactNode } from "react";
import { TreeItem, TreeItemProps } from "./Item/TreeItem";
import { Root } from "./TreeView.style";
import { Manager } from "@jswf/manager";

interface Props {
  children?: ReactNode;
  itemStyle?: number;
  onExpand?: (item: TreeItem, expand: boolean,first:boolean) => void;
  onItemClick?: (item: TreeItem) => void;
  onItemDoubleClick?: (item: TreeItem) => void;
}
interface State {
  item: TreeItemData;
}

export interface TreeItemData {
  itemStyle: number;
  label: ReactNode;
  expand: boolean;
  value: unknown;
  select: boolean;
  checked: boolean;
  uniqueKey: number;
  keys: { [key: string]: unknown };
  parent: TreeItemData | null;
  children: TreeItemData[];
  onExpand?: (expand: boolean,first:boolean) => void;
  onItemClick?: () => void;
  onDoubleClick?: () => void;
}

export const ItemDataDefault = {
  itemStyle: 0,
  label: "",
  value: undefined,
  expand: true,
  select: false,
  checked: false,
  keys: {},
  children: []
};

export var UniqueKey = { value: 1 };
/**
 *TreeViewクラス
 *
 * @export
 * @class TreeView
 * @extends {Component<Props, State>}
 */
export class TreeView extends Component<Props, State> {
  private rootItemRef = createRef<TreeItem>();
  private select: TreeItem | null = null;
  private item: TreeItemData;

  public constructor(props: Props) {
    super(props);
    const createItem = (
      parent: TreeItemData | null,
      element: ReactElement
    ): TreeItemData | null => {
      if (!element || element.type !== TreeItem) return null;

      //アイテムデータの作成
      const p = element.props as TreeItemProps;
      const item: TreeItemData = {
        itemStyle: p.itemStyle || props.itemStyle || 0,
        label: p.label || "",
        expand: p.expand === undefined ? true : p.expand,
        value: p.value,
        select: p.select || false,
        checked: p.checked || false,
        uniqueKey: UniqueKey.value++,
        keys: {},
        parent,
        children: [],
        onExpand: p.onExpand,
        onItemClick: p.onItemClick,
        onDoubleClick: p.onDoubleClick
      };
      //子アイテムの作成
      item.children = (element.props.children
        ? React.Children.map(element.props.children, child => {
            return createItem(item, child);
          }).filter((item:unknown) => item)
        : []) as TreeItemData[];

      return item;
    };

    const rootItem = createItem(null, props.children as ReactElement) || {
      ...ItemDataDefault,
      label: "Root",
      parent: null,
      uniqueKey: UniqueKey.value++
    };

    this.item = rootItem;
    this.state = { item: this.item };
  }
  public render() {
    return (
      <Root>
        <TreeItem
          ref={this.rootItemRef}
          key={this.state.item.uniqueKey}
          treeView={this}
          parent={this}
          item={this.item}
        />
      </Root>
    );
  }
  public componentDidMount(){
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
  public getRootUniqueKey(){
    return this.item.uniqueKey;
  }
}
