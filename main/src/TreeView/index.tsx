import React, { Component, createRef, ReactNode } from "react";
import { TreeItem } from "./Item/TreeItem";
import { Root } from "./TreeView.style";
import { Manager } from "@jswf/manager";
import imgFile from "../../images/file.png";

interface Props {
  children?: ReactNode;
  itemStyle?: number;
  userSelect?: boolean;
  draggable?: boolean;
  dragString?: string;
  onExpand?: (item: TreeItem, expand: boolean, first: boolean) => void;
  onItemClick?: (item: TreeItem) => void;
  onItemDoubleClick?: (item: TreeItem) => void;
  onItemDragStart?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragEnter?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragLeave?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragOver?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDrop?: (e: React.DragEvent, item: TreeItem) => void;
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
  private fileImage?: HTMLImageElement;
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
                draggable={this.props.draggable}
                onItemDragStart={this.onItemDragStart?.bind(this)}
                onItemDragEnter={this.onItemDragEnter?.bind(this)}
                onItemDragLeave={this.onItemDragLeave?.bind(this)}
                onItemDragOver={this.onItemDragOver?.bind(this)}
                onItemDrop={this.onItemDrop?.bind(this)}
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
    this.fileImage = document.createElement("img");
    this.fileImage.src = imgFile;
    this.fileImage.style.height = "64px";
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
  protected onItemDragStart(e: React.DragEvent, item: TreeItem) {
    //コールバックイベントを呼ぶ
    this.props.onItemDragStart?.(e, item);
    //イベントがキャンセルされていなければ転送データを修正
    if (!e.defaultPrevented) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(this.fileImage!, 10, 10);
      try {
        const json = JSON.stringify({
          type: this.props.dragString || "TreeItem",
          value: item.getValue(),
        });
        e.dataTransfer.setData("text/plain", json);
      } catch (e) {}
    }
  }
  protected onItemDragEnter(e: React.DragEvent, item: TreeItem) {
    this.props.onItemDragEnter?.(e, item);
    e.preventDefault();
  }
  protected onItemDragLeave(e: React.DragEvent, item: TreeItem) {
    this.props.onItemDragLeave?.(e, item);
    e.preventDefault();
  }
  protected onItemDragOver(e: React.DragEvent, item: TreeItem) {
    this.props.onItemDragOver?.(e, item);
    e.preventDefault();
  }
  protected onItemDrop(e: React.DragEvent, item: TreeItem) {
    this.props.onItemDrop?.(e, item);
    e.preventDefault();
  }
}
