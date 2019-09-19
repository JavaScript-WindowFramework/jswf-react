import React, { Component, ReactNode, createRef, RefObject } from "react";
import imgAlone from "../../../images/talone.svg";
import imgClose from "../../../images/tclose.svg";
import imgOpen from "../../../images/topen.svg";
import { Root } from "./TreeItem.style";
import { TreeView, TreeItemData, ItemDataDefault, UniqueKey } from "..";

export enum TreeItemStyle {
  CHECKBOX = 1
}

export interface TreeItemProps {
  itemStyle?: number;
  children?: ReactNode;
  label?: ReactNode;
  expand?: boolean;
  value?: unknown;
  treeView?: TreeView;
  parent?: TreeItem | TreeView;
  select?: false;
  checked?: false;
  uniqueKey?: number;
  onExpand?: (expand: boolean) => void;
  onItemClick?: () => void;
  onDoubleClick?: () => void;
  item?: TreeItemData;
}
export interface State {
  item: TreeItemData;
  childAnimation?: boolean;
  expandState?: boolean;
}

/**
 *TreeView用アイテムクラス
 *
 * @export
 * @class TreeItem
 * @extends {Component<TreeItemProps, State>}
 */
export class TreeItem extends Component<TreeItemProps, State> {
  static referenceItem = new Map<number, TreeItem>();
  static defaultProps = {
    itemStyle: 0,
    label: "",
    expand: true,
    select: false,
    checked: false,
    items: []
  };
  private item: TreeItemData;
  private mount: boolean = false;
  public constructor(props: TreeItemProps) {
    super(props);
    this.item = this.props.item!;
    //子アイテムの抽出
    this.state = { item: this.item };
  }
  componentDidMount() {
    this.mount = true;
    TreeItem.referenceItem.set(this.item.uniqueKey, this);
  }
  componentWillUnmount() {
    TreeItem.referenceItem.delete(this.item.uniqueKey);
    this.mount = false;
  }
  public render() {
    return (
      <Root>
        <div
          id="item"
          className={this.state.item.select ? "select" : ""}
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
            onClick={e => {
              this.setExpand(!this.item.expand);
              e.stopPropagation();
            }}
            id="icon"
            src={
              this.state.item.children!.length === 0
                ? imgAlone
                : this.item.expand
                ? imgOpen
                : imgClose
            }
          />
          {(this.state.item.itemStyle! & TreeItemStyle.CHECKBOX) !== 0 && (
            <input
              id="checkbox"
              type="checkbox"
              checked={this.state.item.checked}
              onClick={e => {
                e.stopPropagation();
              }}
              value=""
              onChange={() => this.setChecked(!this.item.checked)}
            />
          )}
          <div id="label">{this.state.item.label}</div>
        </div>
        <div
          style={{
            overflow: this.state.childAnimation ? "hidden" : "visible",
            display:
              this.state.item.expand || this.state.childAnimation
                ? "block"
                : "none"
          }}
          id="child"
          className={
            this.state.expandState
              ? this.state.item.expand
                ? "open"
                : "close"
              : ""
          }
          onAnimationStart={e => {
            this.setState({ childAnimation: true });
            e.stopPropagation();
          }}
          onAnimationEnd={e => {
            this.setState({ childAnimation: false });
            e.stopPropagation();
          }}
        >
          <div>
            <div id="line"></div>
            <div id="children">
              {this.state.item.children!.map(item => (
                <TreeItem
                  key={item.uniqueKey}
                  treeView={this.props.treeView}
                  parent={this}
                  item={item}
                />
              ))}
            </div>
          </div>
        </div>
      </Root>
    );
  }
  public updateState() {
    if (this.mount) {
      this.setState({ item: this.item });
    } else {
      const item = TreeItem.referenceItem.get(this.item.uniqueKey);
      if (item) item.setState({ item: this.item });
    }
  }
  public onSelect(select: boolean) {
    this.item.select = select;
    this.updateState();
  }
  setExpand(expand: boolean) {
    if (this.item.expand !== expand) {
      this.item.expand = expand;
      this.setState({
        item: this.item,
        childAnimation: true,
        expandState: true
      });
      this.props.treeView &&
        this.props.treeView.props.onExpand &&
        this.props.treeView.props.onExpand(this, expand);
      this.props.onExpand && this.props.onExpand(expand);
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
    return this.item.label;
  }
  /**
   *ラベルを設定する
   *
   * @param {ReactNode} label
   * @memberof TreeItem
   */
  public setLabel(label: ReactNode): void {
    this.item.label = label;
    this.updateState();
  }
  /**
   *値を取得する
   *
   * @returns {unknown}
   * @memberof TreeItem
   */
  getValue(): unknown {
    return this.item.value;
  }
  /**
   *値を設定する
   *
   * @param {unknown} value
   * @memberof TreeItem
   */
  setValue(value: unknown): void {
    this.item.value = value;
    this.updateState();
  }
  /**
   *valueに該当するアイテムを一つ見つける
   *
   * @param {unknown} value
   * @returns {(TreeItem | null)}
   * @memberof TreeItem
   */
  public findItem(value: unknown): TreeItem | null {
    const find = (item: TreeItemData): TreeItem | null => {
      if (item.value === value) return new TreeItem({ item });
      if (item.children) {
        for (const child of item.children) {
          const target = find(child);
          if (target) {
            return target;
          }
        }
      }
      return null;
    };
    return find(this.item);
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
    return items;
  }
  /**
   *アイテムの追加
   *
   * @param {TreeItemProps} props
   * @memberof TreeItem
   */
  public addItem(props?: TreeItemProps): TreeItem {
    const item: TreeItemData = props
      ? {
          itemStyle: props.itemStyle || this.item.itemStyle || 0,
          label: props.label || "",
          expand: props.expand === undefined ? true : props.expand,
          value: props.value,
          select: props.select || false,
          checked: props.checked || false,
          uniqueKey: UniqueKey.value++,
          keys: {},
          parent: this.item,
          children: [],
          onExpand: props.onExpand,
          onItemClick: props.onItemClick,
          onDoubleClick: props.onDoubleClick
        }
      : {
          ...ItemDataDefault,
          uniqueKey: UniqueKey.value++,
          itemStyle: this.item.itemStyle,
          parent: this.item
        };
    this.item.children!.push(item);
    this.updateState();
    return new TreeItem({ item });
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
    return false;
  }
  /**
   *自分自身を削除
   *
   * @memberof TreeItem
   */
  public remove(): void {
    if (this.item.parent) {
      const children = this.item.parent.children;
      for (let i = 0, l = children.length; i < l; i++) {
        if (this.item.uniqueKey === children[i].uniqueKey) {
          children.splice(i, 1);
          const item = TreeItem.referenceItem.get(this.item.parent.uniqueKey);
          item!.updateState();
          break;
        }
      }
    }
  }
  /**
   *子アイテムをすべて削除
   *
   * @memberof TreeItem
   */
  public clear(): void {
    this.item.children = [];
    this.updateState();
  }
  /**
   *子アイテムを取得
   *
   * @returns {TreeItemProps[]}
   * @memberof TreeItem
   */
  public getChildren(): TreeItemData[] {
    return this.item.children!;
  }
  /**
   *チェックボックスの設定
   *
   * @param {boolean} checked
   * @memberof TreeItem
   */
  public setChecked(checked: boolean): void {
    this.item.checked = checked;
    this.updateState();
  }
  /**
   *チェックされているアイテムを返す
   *
   * @returns {TreeItem[]}
   * @memberof TreeItem
   */
  public getCheckItems(): TreeItem[] {
    const checks: TreeItem[] = [];
    const callChild = (item: TreeItemData) => {
      if (item.checked) checks.push(new TreeItem({ item }));
      if (item.children) {
        for (const child of item.children) {
          callChild(child);
        }
      }
    };
    callChild(this.item);
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
    this.item.keys[name] = value;
  }
  /**
   *アイテムのキーを取得する
   *
   * @param {string} name
   * @returns
   * @memberof TreeItem
   */
  public getKey(name: string): unknown {
    return this.item.keys[name];
  }
}
