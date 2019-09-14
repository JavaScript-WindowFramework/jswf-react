import React, {
  Component,
  ReactNode,
  ReactElement,
  createRef,
  RefObject
} from "react";
import imgAlone from "../../../images/talone.svg";
import imgClose from "../../../images/tclose.svg";
import imgOpen from "../../../images/topen.svg";
import { Root } from "./TreeItem.style";
import { TreeView } from "..";
import { objectAssign } from "../../lib/Manager";

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
  onItemClick?: (item: TreeItem) => void;
  onDoubleClick?: (item: TreeItem) => void;
}
interface State {}

/**
 *TreeView用アイテムクラス
 *
 * @export
 * @class TreeItem
 * @extends {Component<TreeItemProps, State>}
 */
export class TreeItem extends Component<TreeItemProps, State> {
  static defaultProps = {
    itemStyle: 0,
    label: "",
    expand: true,
    select: false,
    checked: false
  };

  private childRef: RefObject<HTMLDivElement> = createRef();
  private itemsRef: RefObject<TreeItem>[] = [];
  private items: TreeItemProps[];
  public constructor(props: TreeItemProps) {
    super(props);
    //子アイテムの抽出
    const items = React.Children.toArray(this.props.children)
      .filter(item => {
        return (item as ReactElement).type === TreeItem;
      })
      .map(item =>
        objectAssign({}, (item as ReactElement).props)
      ) as TreeItemProps[];

    this.items = items;
  }

  public render() {
    this.itemsRef = this.items.map(() => {
      return createRef();
    });
    return (
      <Root>
        <div
          id="item"
          className={this.props.select ? "select" : ""}
          onClick={() => {
            this.props.onItemClick && this.props.onItemClick(this);
            if (this.props.treeView) {
              this.props.treeView.selectItem(this);
              this.props.treeView.props.onItemClick &&
                this.props.treeView.props.onItemClick(this);
            }
          }}
          onDoubleClick={() => {
            this.props.onDoubleClick && this.props.onDoubleClick(this);
            this.props.treeView &&
              this.props.treeView.props.onItemDoubleClick &&
              this.props.treeView.props.onItemDoubleClick(this);
          }}
        >
          <img
            onClick={e => {
              const expand = !this.props.expand;
              this.setParentState({ expand });
              e.stopPropagation();
              if (expand) this.childRef.current!.style.display = "block";
            }}
            id="icon"
            src={
              React.Children.count(this.props.children) === 0
                ? imgAlone
                : this.props.expand
                ? imgOpen
                : imgClose
            }
          />
          {(this.props.itemStyle! & TreeItemStyle.CHECKBOX) !== 0 && (
            <input
              id="checkbox"
              type="checkbox"
              checked={this.props.checked}
              onClick={e => {
                e.stopPropagation();
              }}
              value=""
              onChange={() => this.setChecked(!this.props.checked)}
            />
          )}
          <div id="label">{this.props.label}</div>
        </div>
        <div
          ref={this.childRef}
          id="child"
          className={this.props.expand ? "open" : "close"}
          onAnimationStart={() => {
            this.childRef.current!.style.overflow = "hidden";
          }}
          onAnimationEnd={() => {
            this.childRef.current!.style.overflow = "visible";
            if (!this.props.expand)
              this.childRef.current!.style.display = "none";
          }}
        >
          <div>
            <div id="line"></div>
            <div id="children">
              {this.items.map((item, index) => (
                <TreeItem
                  {...item}
                  key={index}
                  ref={this.itemsRef[index]}
                  treeView={this.props.treeView}
                  parent={this}
                  itemStyle={this.props.itemStyle}
                />
              ))}
            </div>
          </div>
        </div>
      </Root>
    );
  }
  public onSelect(select: boolean) {
    this.setParentState({ select });
  }
  public setProps(item: TreeItem, state: TreeItemProps) {
    const index = this.itemsRef.findIndex(itemRef => {
      return itemRef.current === item;
    });
    if (index >= 0) {
      for (const key of Object.keys(state)) {
        this.items[index][key as keyof TreeItemProps] = state[
          key as keyof TreeItemProps
        ] as never;
      }
      this.forceUpdate();
    }
  }
  public setParentState(state: object) {
    this.props.parent!.setProps(this, state);
  }
  /**
   *ラベルを返す
   *
   * @returns {React.ReactNode}
   * @memberof TreeItem
   */
  public getLabel(): React.ReactNode {
    return this.props.label;
  }
  /**
   *ラベルを設定する
   *
   * @param {ReactNode} label
   * @memberof TreeItem
   */
  public setLabel(label: ReactNode): void {
    this.setParentState({ label });
  }
  /**
   *値を取得する
   *
   * @returns {unknown}
   * @memberof TreeItem
   */
  getValue(): unknown {
    return this.props.value;
  }
  /**
   *値を設定する
   *
   * @param {unknown} value
   * @memberof TreeItem
   */
  setValue(value: unknown): void {
    this.setParentState({ value });
  }
  /**
   *valueに該当するアイテムを一つ見つける
   *
   * @param {unknown} value
   * @returns {(TreeItem | null)}
   * @memberof TreeItem
   */
  public findItem(value: unknown): TreeItem | null {
    if (this.props.value === value) return this;
    for (const item of this.itemsRef) {
      const target = item.current!.findItem(value);
      if (target) return target;
    }
    return null;
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
    if (this.props.value === value) items.push(this);
    for (const item of this.itemsRef) {
      items.push(...item.current!.findItems(value));
    }
    return items;
  }
  /**
   *アイテムの追加
   *
   * @param {TreeItemProps} props
   * @memberof TreeItem
   */
  public addItem(props: TreeItemProps): void {
    this.items.push(props);
    this.forceUpdate();
  }
  /**
   *指定したアイテムを削除
   *
   * @param {TreeItem} item
   * @returns {boolean}
   * @memberof TreeItem
   */
  public delItem(item: TreeItem): boolean {
    const index = this.itemsRef.findIndex(itemRef => {
      return itemRef.current === item;
    });
    if (index >= 0) {
      if (
        this.props.treeView &&
        this.props.treeView.getSelectItem() === this.itemsRef[index].current
      )
        this.props.treeView.selectItem(null);
      this.itemsRef.splice(index, 1);
      this.items.splice(index, 1);
      this.forceUpdate();
      return true;
    } else {
      for (const itemRef of this.itemsRef) {
        if (itemRef.current!.delItem(item)) return true;
      }
    }
    return false;
  }
  /**
   *自分自身を削除
   *
   * @memberof TreeItem
   */
  public remove(): void {
    if (this.props.parent) this.props.parent.delItem(this);
    this.forceUpdate();
  }
  /**
   *子アイテムをすべて削除
   *
   * @memberof TreeItem
   */
  public clear(): void {
    this.setState({ items: [] });
    this.forceUpdate();
  }
  /**
   *子アイテムを取得
   *
   * @returns {TreeItemProps[]}
   * @memberof TreeItem
   */
  public getChildren(): TreeItemProps[] {
    return this.items;
  }
  /**
   *チェックボックスの設定
   *
   * @param {boolean} checked
   * @memberof TreeItem
   */
  public setChecked(checked: boolean): void {
    this.setParentState({ checked });
    for (const item of this.itemsRef) {
      item.current!.setChecked(checked);
    }
  }
  /**
   *チェックされているアイテムを返す
   *
   * @returns {TreeItem[]}
   * @memberof TreeItem
   */
  public getCheckItems(): TreeItem[] {
    const checks: TreeItem[] = [];
    if (this.props.checked) checks.push(this);
    for (const item of this.itemsRef) {
      checks.push(...item.current!.getCheckItems());
    }
    return checks;
  }
}
