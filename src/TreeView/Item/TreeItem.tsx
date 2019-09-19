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
  uniqueKey?: number;
  items?: TreeItemProps[];
  onExpand?: (expand: boolean) => void;
  onItemClick?: () => void;
  onDoubleClick?: () => void;
}
export interface State {
  items: TreeItemProps[];
}
let uniqueKey: number = 1;
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
    checked: false,
    items: []
  };
  state: State = { items: [] };
  private childRef: RefObject<HTMLDivElement> = createRef();
  private itemsRef: RefObject<TreeItem>[] = [];
  private items: TreeItemProps[];
  private itemsMap = new Map<number, TreeItemProps>();
  private keys: { [key: string]: unknown } = {};
  private mount: boolean = false;
  public constructor(props: TreeItemProps) {
    super(props);
    //子アイテムの抽出
    const items = React.Children.toArray(this.props.children)
      .filter(item => {
        return (item as ReactElement).type === TreeItem;
      })
      .map(item => {
        const key = (item as ReactElement).props.uniqueKey || ++uniqueKey;
        return {
          ...(item as ReactElement).props,
          uniqueKey: key
        };
      }) as TreeItemProps[];
    if (this.props.items) this.items = [...this.props.items!, ...items];
    else this.items = items;
    for (const item of this.items) {
      this.itemsMap.set(item.uniqueKey!, item);
    }
    this.state = { items: this.items };
  }
  componentDidMount() {
    this.mount = true;
  }
  componentWillUnmount() {
    this.mount = false;
  }
  componentDidUpdate() {
    // if (this.props.items && this.state.items !== this.props.items)
    //   this.setState({ items: this.props.items });

  }
  public render() {
    this.itemsRef = this.state.items.map(() => {
      return createRef();
    });
    return (
      <Root>
        <div
          id="item"
          className={this.props.select ? "select" : ""}
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
              const expand = !this.props.expand;
              this.setParentProps({ expand });
              e.stopPropagation();
              if (expand) this.childRef.current!.style.display = "block";
              this.props.onExpand && this.props.onExpand(expand);
            }}
            id="icon"
            src={
              this.state.items.length === 0
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
              {this.state.items.map((item, index) => (
                <TreeItem
                  {...item}
                  key={item.uniqueKey || ++uniqueKey}
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
    this.setParentProps({ select });
  }
  public setProps(item: TreeItem, props: TreeItemProps) {
    /*  let index: number;
    let length = this.items.length;
    for (index = 0; index < length; index++) {
      if (this.items[index].uniqueKey === item.props.uniqueKey) break;
    }
    if (index < this.items.length) {
      objectAssign(this.items[index], props);
      this.mount && this.forceUpdate();
    }*/

    const i = this.itemsMap.get(item.props.uniqueKey!)!;
    console.log(i);
    if (i) {
      objectAssign(i, props);
      this.mount && this.forceUpdate();
    }
  }
  public setParentProps(props: object) {
    this.props.parent!.setProps(this, props);
  }
  public getProps<K extends keyof TreeItemProps>(
    item: TreeItem,
    key: K
  ): TreeItemProps[K] {
    let index: number;
    let length = this.items.length;
    for (index = 0; index < length; index++) {
      if (this.items[index].uniqueKey === item.props.uniqueKey) break;
    }
    return this.items[index][key];
  }
  public getParentProps<K extends keyof TreeItemProps>(key: K) {
    return this.props.parent!.getProps(this, key);
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
    return this.getParentProps("label");
  }
  /**
   *ラベルを設定する
   *
   * @param {ReactNode} label
   * @memberof TreeItem
   */
  public setLabel(label: ReactNode): void {
    this.setParentProps({ label });
  }
  /**
   *値を取得する
   *
   * @returns {unknown}
   * @memberof TreeItem
   */
  getValue(): unknown {
    return this.getParentProps("value");
  }
  /**
   *値を設定する
   *
   * @param {unknown} value
   * @memberof TreeItem
   */
  setValue(value: unknown): void {
    this.setParentProps({ value });
  }
  /**
   *valueに該当するアイテムを一つ見つける
   *
   * @param {unknown} value
   * @returns {(TreeItem | null)}
   * @memberof TreeItem
   */
  public findItem(value: unknown): TreeItem | null {
    const find = (item: TreeItemProps): TreeItem | null => {
      if (item.value === value) return new TreeItem(item);
      if (item.items) {
        for (const child of item.items) {
          const target = find(child);
          if (target) {
            return target;
          }
        }
      }
      return null;
    };
    return find(this.props);
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
  public addItem(props?: TreeItemProps): TreeItem {
    const newProps = {
      ...props,
      parent: this,
      uniqueKey: uniqueKey++
    };
    let items = this.getParentProps("items");
    if (items) items.push(newProps);
    else items = [newProps];
    this.setParentProps({ items });
    this.items.push(newProps);
    this.itemsMap.set(newProps.uniqueKey!, newProps);
    if (this.mount) this.setState({items:this.items})
    //if (this.mount) this.forceUpdate();
    return new TreeItem(newProps);
  }
  /**
   *指定したアイテムを削除
   *
   * @param {TreeItem} item
   * @returns {boolean}
   * @memberof TreeItem
   */
  public delItem(item: TreeItem): boolean {
    const itemsRef = this.itemsRef;
    let index: number;
    let length = itemsRef.length;
    for (index = 0; index < length; index++) {
      if (itemsRef[index].current === item) break;
    }
    if (index < length) {
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
    this.setParentProps({ checked });
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
