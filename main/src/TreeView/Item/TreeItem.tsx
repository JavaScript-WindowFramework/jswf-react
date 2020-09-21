import React, { Component, ReactNode } from "react";
import imgAlone from "../../../images/talone.svg";
import imgClose from "../../../images/tclose.svg";
import imgOpen from "../../../images/topen.svg";
import { Root } from "./TreeItem.style";
import { TreeView, ItemDataDefault, UniqueKey } from "..";

export enum TreeItemStyle {
  CHECKBOX = 1,
}

export interface Props {
  key?: string | number;
  itemStyle?: number;
  children?: ReactNode;
  label?: ReactNode;
  expand?: boolean;
  value?: unknown;
  treeView?: TreeView;
  parent?: TreeItem;
  select?: boolean;
  checked?: boolean;
  uniqueKey?: number;
  draggable?: boolean;
  onExpand?: (expand: boolean, create: boolean) => void;
  onItemClick?: () => void;
  onDoubleClick?: () => void;
  onRef?: (item: TreeItem) => void;
  onItemDragStart?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragEnter?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragLeave?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDragOver?: (e: React.DragEvent, item: TreeItem) => void;
  onItemDrop?: (e: React.DragEvent, item: TreeItem) => void;
}
export interface State {
  childAnimation?: boolean;
  expandState?: boolean;
  expand?: boolean;
  select?: boolean;
  itemStyle?: number;
  checked?: boolean;
  label?: ReactNode;
  children?: ReactNode;
  dragOver?: boolean;
}

/**
 *TreeView用アイテムクラス
 *
 * @export
 * @class TreeItem
 * @extends {Component<Props, State>}
 */
export class TreeItem extends Component<Props, State> {
  static referenceItem = new Map<number, TreeItem>();
  static defaultProps = {
    label: "",
    expand: true,
    select: false,
    checked: false,
  };
  private value: unknown;
  private keys: { [key: string]: unknown } = {};
  private children = new Set<TreeItem>();
  public constructor(props: Props) {
    super(props);
    this.state = {};
    props.onRef?.(this);
    props.parent?.addChild(this);
  }

  componentDidMount() {
    //開閉イベントの初回実行
    setTimeout(() => {
      this.props.treeView &&
        this.props.treeView.props.onExpand &&
        this.props.treeView.props.onExpand(this, this.isExpand(), true);
      this.props.onExpand && this.props.onExpand(this.isExpand(), true);
    });
  }
  componentWillUnmount() {
    this.props.parent?.removeChild(this);
  }
  protected addChild(item: TreeItem) {
    this.children.add(item);
  }
  protected removeChild(item: TreeItem) {
    this.children.delete(item);
  }
  public render() {
    return (
      <Root>
        <div
          id="item"
          className={
            (this.isSelect() ? "select" : "") +
            (this.state.dragOver ? " over" : "")
          }
          onClick={() => {
            this.props.onItemClick && this.props.onItemClick();
            if (this.props.treeView) {
              this.props.treeView.selectItem(this);
              this.props.treeView.props.onItemClick &&
                this.props.treeView.props.onItemClick(this);
            }
          }}
          onDoubleClick={() => {
            this.props.onDoubleClick && this.props.onDoubleClick();
            this.props.treeView &&
              this.props.treeView.props.onItemDoubleClick &&
              this.props.treeView.props.onItemDoubleClick(this);
          }}
        >
          <img
            onClick={(e) => {
              this.setExpand(!this.isExpand());
              e.stopPropagation();
            }}
            id="icon"
            src={
              React.Children.count(this.getChildren()) === 0
                ? imgAlone
                : this.isExpand()
                ? imgOpen
                : imgClose
            }
          />
          {(this.getItemStyle() & TreeItemStyle.CHECKBOX) !== 0 && (
            <input
              id="checkbox"
              type="checkbox"
              checked={this.isChecked()}
              onClick={(e) => {
                e.stopPropagation();
              }}
              value=""
              onChange={() => this.setChecked(!this.isChecked())}
            />
          )}
          <div
            id="label"
            draggable={this.props.draggable}
            onDragStart={(e) => {
              this.props.onItemDragStart?.(e, this);
            }}
            onDragEnter={(e) => this.props.onItemDragEnter?.(e, this)}
            onDragLeave={(e) => {
              this.setState({ dragOver: false });
              this.props.onItemDragLeave?.(e, this);
            }}
            onDragOver={(e) => {
              this.setState({ dragOver: true });
              this.props.onItemDragOver?.(e, this);
            }}
            onDrop={(e) => {
              this.setState({ dragOver: false });
              this.props.onItemDrop?.(e, this);
            }}
          >
            {this.getLabel()}
          </div>
        </div>
        <div
          style={{
            overflow: this.state.childAnimation ? "hidden" : "visible",
            display:
              this.isExpand() || this.state.childAnimation ? "block" : "none",
          }}
          id="child"
          className={
            this.state.expandState ? (this.isExpand() ? "open" : "close") : ""
          }
          onAnimationStart={(e) => {
            this.setState({ childAnimation: true });
            e.stopPropagation();
          }}
          onAnimationEnd={(e) => {
            this.setState({ childAnimation: false });
            e.stopPropagation();
          }}
        >
          <div>
            <div id="line"></div>
            <div id="children">
              {React.Children.map(
                this.getChildren(),
                (item) =>
                  typeof item === "object" &&
                  item &&
                  "type" in item &&
                  item.type === TreeItem && (
                    <TreeItem
                      draggable={this.props.draggable}
                      onItemDragStart={this.props.onItemDragStart}
                      onItemDragEnter={this.props.onItemDragEnter}
                      onItemDragLeave={this.props.onItemDragLeave}
                      onItemDragOver={this.props.onItemDragOver}
                      onItemDrop={this.props.onItemDrop}
                      {...item.props}
                      key={item.key}
                      ref={() => {
                        this.props.onRef?.(this);
                      }}
                      treeView={this.props.treeView}
                      parent={this}
                    />
                  )
              )}
            </div>
          </div>
        </div>
      </Root>
    );
  }
  public onSelect(select: boolean) {
    if (this.props.treeView?.props.userSelect !== false)
      this.setState({ select });
    let parent: TreeItem | TreeView | undefined = this;
    while (
      (parent = "parent" in parent.props ? parent.props.parent : undefined)
    ) {
      if (parent && "setExpand" in parent) parent.setExpand(true);
    }
  }
  public isSelect() {
    return this.state.select !== undefined
      ? this.state.select
      : this.props.select!;
  }
  isExpand() {
    return this.state.expand !== undefined
      ? this.state.expand
      : this.props.expand!;
  }
  isChecked() {
    return this.state.checked !== undefined
      ? this.state.checked
      : this.props.checked!;
  }
  public getItemStyle() {
    return this.state.itemStyle !== undefined
      ? this.state.itemStyle
      : this.props.itemStyle || this.props.treeView?.props.itemStyle || 0;
  }
  /**
   *ツリーの開閉を行う
   *
   * @param {boolean} expand 開閉状態
   * @memberof TreeItem
   */
  setExpand(expand: boolean) {
    if (this.isExpand() !== expand) {
      this.setState({
        childAnimation: true,
        expandState: true,
        expand,
      });
      this.props.treeView &&
        this.props.treeView.props.onExpand &&
        this.props.treeView.props.onExpand(this, expand, false);
      this.props.onExpand && this.props.onExpand(expand, false);
    }
  }
  /**
   *アイテムを選択する
   *
   * @memberof TreeItem
   */
  public select() {
    this.props.treeView!.selectItem(this);
  }
  /**
   *ラベルを返す
   *
   * @returns {React.ReactNode}
   * @memberof TreeItem
   */
  public getLabel(): React.ReactNode {
    return this.state.label !== undefined
      ? this.state.label
      : this.props.label!;
  }
  /**
   *ラベルを設定する
   *
   * @param {ReactNode} label
   * @memberof TreeItem
   */
  public setLabel(label: ReactNode): void {
    this.setState({ label });
  }
  /**
   *値を取得する
   *
   * @returns {unknown}
   * @memberof TreeItem
   */
  getValue(): unknown {
    return this.value !== undefined ? this.value : this.props.value;
  }
  /**
   *値を設定する
   *
   * @param {unknown} value
   * @memberof TreeItem
   */
  setValue(value: unknown): void {
    this.value = value;
  }
  /**
   *valueに該当するアイテムを一つ見つける
   *
   * @param {unknown} value
   * @returns {(TreeItem | null)}
   * @memberof TreeItem
   */
  public findItem(value: unknown): TreeItem | null {
    const find = (item: TreeItem): TreeItem | null => {
      if (item.value === value) return item;
      const children = item.getChildren?.();
      if (children) {
        for (const child of React.Children.toArray(children)) {
          const target = find(child as TreeItem);
          if (target) {
            return target;
          }
        }
      }
      return null;
    };
    return find(this);
  }
  /**
   *valueに該当するアイテムを複数見つける
   *
   * @param {unknown} value
   * @returns {TreeItem[]}
   * @memberof TreeItem
   */
  public findItems(value: unknown): TreeItem[] {
    const items: TreeItem[] = [];
    const callChild = (item: TreeItem) => {
      if (item.value === value) items.push(item);
      const children = item.getChildren?.();
      if (children) {
        for (const child of React.Children.toArray(children)) {
          callChild(child as TreeItem);
        }
      }
    };
    callChild(this);
    return items;
  }
  /**
   *アイテムの追加
   *
   * @param {Props} props
   * @memberof TreeItem
   */
  public addItem(props?: Props): Promise<TreeItem> {
    const that = this;
    return new Promise((resolve) => {
      const item: Props = props
        ? {
            itemStyle: props.itemStyle || that.getItemStyle(),
            label: props.label || "",
            expand: props.expand === undefined ? true : props.expand,
            value: props.value,
            checked: props.checked || false,
            uniqueKey: UniqueKey.value++,
            treeView: that.props.treeView,
            parent: that,
            onExpand: props.onExpand,
            onItemClick: props.onItemClick,
            onDoubleClick: props.onDoubleClick,
          }
        : {
            ...ItemDataDefault,
            treeView: that.props.treeView,
            uniqueKey: UniqueKey.value++,
            itemStyle: that.getItemStyle(),
            parent: that,
          };
      that.setState({
        children: [
          ...React.Children.toArray(that.getChildren()),
          <TreeItem
            key={item.uniqueKey}
            {...item}
            onRef={(item) => {
              resolve(item);
            }}
          />,
        ],
      });
    });
  }
  /**
   *指定したアイテムを削除
   *
   * @param {TreeItem} item
   * @returns {boolean}
   * @memberof TreeItem
   */
  public delItem(item: TreeItem): boolean {
    item.remove();
    return true;
  }
  /**
   *自分自身を削除
   *
   * @memberof TreeItem
   */
  public remove(): void {
    const parent = this.props.parent as TreeItem;
    if (parent) {
      const children = React.Children.toArray(
        parent.getChildren()
      ) as React.ReactElement<Props>[];
      const newChildren = children.filter(
        (item) => this.props.uniqueKey !== item.props.uniqueKey
      );
      parent.setState({ children: newChildren });
    }
  }
  /**
   *子アイテムをすべて削除
   *
   * @memberof TreeItem
   */
  public clear(): void {
    // this.item.children = [];
  }
  /**
   *子アイテムを取得
   *
   * @returns {Props[]}
   * @memberof TreeItem
   */

  public getChildren(): ReactNode {
    return this.state.children !== undefined
      ? this.state.children
      : this.props.children;
  }
  /**
   *チェックボックスの設定
   *
   * @param {boolean} checked
   * @memberof TreeItem
   */
  public setChecked(checked: boolean): void {
    this.setState({ checked });
  }
  /**
   *チェックされているアイテムを返す
   *
   * @returns {TreeItem[]}
   * @memberof TreeItem
   */
  public getCheckItems(): TreeItem[] {
    const checks: TreeItem[] = [];
    const callChild = (item: TreeItem) => {
      if (item.isChecked()) checks.push(item);
      for (const child of Array.from(item.children)) {
        callChild(child);
      }
    };
    callChild(this);
    return checks;
  }
  /**
   *アイテムに対してキーを関連付ける
   *
   * @param {string} name
   * @param {*} value
   * @memberof TreeItem
   */
  public setKey(name: string, value: unknown): void {
    this.keys[name] = value;
  }
  /**
   *アイテムのキーを取得する
   *
   * @param {string} name
   * @returns
   * @memberof TreeItem
   */
  public getKey(name: string): unknown {
    return this.keys[name];
  }
}
