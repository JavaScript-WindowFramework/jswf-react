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
interface Props {
  children?: ReactNode;
  label?: ReactNode;
  expand?: boolean;
  value?: unknown;
  treeView?: TreeView;
  parent?: TreeItem;
  onItemClick?: (item: TreeItem) => void;
  onDoubleClick?: (item: TreeItem) => void;
}
interface State {
  expand: boolean;
  label: ReactNode;
  value: unknown;
  select: boolean;
  checked: boolean;
  items: TreeItem[];
}

export class TreeItem extends Component<Props, State> {
  static defaultProps = { label: "", expand: true };

  childRef: RefObject<HTMLDivElement> = createRef();
  itemsRef: RefObject<TreeItem>[] = [];
  keepProps: Props;
  constructor(props: Props) {
    super(props);
    this.keepProps = props;
    //子アイテムの抽出
    const items = React.Children.toArray(this.props.children).filter(item => {
      return (item as ReactElement).type === TreeItem;
    }) as TreeItem[];

    this.state = {
      items: items,
      select: false,
      checked: false,
      expand: this.props.expand!,
      label: this.props.label,
      value: this.props.value
    };
  }
  componentDidUpdate() {
    if (this.keepProps.children !== this.props.children) {
      const items = React.Children.toArray(this.props.children).filter(item => {
        return (item as ReactElement).type === TreeItem;
      }) as TreeItem[];
      this.setState({items});
      this.keepProps = this.props;
    }
  }
  render() {
    this.itemsRef = this.state.items.map(() => {
      return createRef();
    });
    for (const item of this.state.items) console.log(item.props.label);
    return (
      <Root>
        <div
          id="item"
          className={this.state.select ? "select" : ""}
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
              const expand = !this.state.expand;
              this.setState({ expand });
              e.stopPropagation();
              //e.preventDefault();
              if (expand) this.childRef.current!.style.display = "block";
            }}
            id="icon"
            src={
              React.Children.count(this.props.children) === 0
                ? imgAlone
                : this.state.expand
                ? imgOpen
                : imgClose
            }
          />
          <input
            id="checkbox"
            type="checkbox"
            checked={this.state.checked}
            onClick={e => {
              e.stopPropagation();
            }}
            value=""
            onChange={() => this.setChecked(!this.state.checked)}
          />
          <div id="label">{this.state.label}</div>
        </div>
        <div
          ref={this.childRef}
          id="child"
          className={this.state.expand ? "open" : "close"}
          onAnimationStart={() => {
            this.childRef.current!.style.overflow = "hidden";
          }}
          onAnimationEnd={() => {
            this.childRef.current!.style.overflow = "visible";
            if (!this.state.expand)
              this.childRef.current!.style.display = "none";
          }}
        >
          <div>
            <div id="line"></div>
            <div id="children">
              {this.state.items.map((item, index) => (
                <TreeItem
                  {...item.props}
                  key={index}
                  ref={this.itemsRef[index]}
                  treeView={this.props.treeView}
                  parent={this}
                />
              ))}
            </div>
          </div>
        </div>
      </Root>
    );
  }
  getLabel() {
    return this.state.label;
  }
  setLabel(label: ReactNode) {
    this.setState({ label: label });
  }
  findItem(value: unknown): TreeItem | null {
    if (this.state.value === value) return this;
    for (const item of this.state.items) {
      const target = item.findItem(value);
      if (target) return target;
    }
    return null;
  }
  findItems(value: unknown): TreeItem[] {
    const items: TreeItem[] = [];
    if (this.state.value === value) items.push(this);
    for (const item of this.state.items) {
      items.push(...item.findItems(value));
    }
    return items;
  }
  addItem(props: Props) {
    this.state.items.push(new TreeItem(props));
    this.forceUpdate();
  }
  delItem(item: TreeItem) {
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
      const items = this.state.items.slice();
      items.splice(index, 1);
      this.setState({ items });
      this.forceUpdate();
      return true;
    } else {
      for (const itemRef of this.itemsRef) {
        if (itemRef.current!.delItem(item)) return true;
      }
    }
    return false;
  }
  remove() {
    if (this.props.parent) this.props.parent.delItem(this);
    this.forceUpdate();
  }
  clear() {
    this.setState({ items: [] });
    this.forceUpdate();
  }
  getChildren() {
    return this.state.items;
  }
  onSelect(select: boolean) {
    this.setState({ select });
  }
  setChecked(checked: boolean) {
    this.setState({ checked });
    for (const item of this.itemsRef) {
      item.current!.setChecked(checked);
    }
  }
  getCheckItems() {
    const checks: TreeItem[] = [];
    if (this.state.checked) checks.push(this);
    for (const item of this.itemsRef) {
      checks.push(...item.current!.getCheckItems());
    }
    return checks;
  }
}
