import ResizeObserver from "resize-observer-polyfill";
import React, {
  Component,
  ReactNode,
  ReactElement,
  createRef,
  ReactComponentElement
} from "react";
import { Root } from "./ListView.style";
import { HeaderArea } from "./Header/Headers";
import { ItemArea, ItemRow } from "./Item/Items";
import { ListRow, ListHeaders } from "./ExportDefinition";
import { getSetValues } from "../lib/Manager";
export * from "./ExportDefinition";

export const ListViewDragString = "ListViewDragData";

export interface ListViewDragData {
  type: string;
  items: ItemRow[];
}

interface Props {
  draggable?: boolean;
  dragString?: string;
  children?: ReactNode;
  onItemClick?: (row: number, col: number) => void;
  onItemDoubleClick?: (row: number, col: number) => void;
  onItemDragStart?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragEnter?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragLeave?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragOver?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDrop?: (e: React.DragEvent, row: number, col: number) => void;
  onDrop?: (e: React.DragEvent) => void;
}
interface State {
  xScroll: number;
  headerSizes: number[];
  sortIndex?: number;
  sortOrder?: boolean;
  sortType?: string;
  selectItems: Set<number>;
  clientWidth?: number;
}
/**
 *WindowsライクなListView
 *
 * @export
 * @class ListView
 * @extends {Component<Props, State>}
 */
export class ListView extends Component<Props, State> {
  static defaultProps = {
    draggable: false,
    dragString: ListViewDragString,
    children: []
  };
  private resizeObserver?: ResizeObserver;
  private rootRef = createRef<HTMLDivElement>();
  private itemsRef = createRef<ItemArea>();
  private headersRef = createRef<HeaderArea>();
  private itemRows: ReactComponentElement<typeof ListRow>[] = [];
  private headers: ReactElement[] = [];
  private manual: boolean = false;

  public constructor(props: Props) {
    super(props);

    this.state = {
      xScroll: 0,
      headerSizes: [],
      sortIndex: -1,
      selectItems: new Set()
    };
    this.createItem(props);
  }
  createItem(props: Props) {
    const itemRows = [];
    const children = React.Children.toArray(
      props.children
    ) as React.ReactElement[];
    for (const child of children) {
      if (child.type === ListHeaders)
        this.headers = child.props.children as ReactElement[];
      else if (child.type === ListRow)
        itemRows.push(child as ReactComponentElement<typeof ListRow>);
    }
    this.itemRows = itemRows;
  }
  shouldComponentUpdate(props: Props) {
    if (!this.manual) {
      if (this.props !== props) {
        this.createItem(props);
      }
    }
    return true;
  }
  public isManual() {
    return this.manual;
  }
  public render(): JSX.Element {
    return (
      <Root
        ref={this.rootRef}
        onDrop={this.props.onDrop}
        onScroll={e => {
          this.setState({ xScroll: this.rootRef.current!.scrollLeft });
        }}
      >
        <HeaderArea
          clientWidth={this.state.clientWidth}
          ref={this.headersRef}
          onClick={this.onHeaderClick.bind(this)}
          onSize={headerSizes => this.setState({ headerSizes })}
        >
          {this.headers}
        </HeaderArea>
        <ItemArea
          ref={this.itemsRef}
          headerTypes={
            this.headersRef.current ? this.headersRef.current!.getTypes() : []
          }
          listView={this}
          draggable={this.props.draggable!}
          selectItems={this.state.selectItems}
          sortIndex={this.state.sortIndex}
          sortOrder={this.state.sortOrder}
          sortType={this.state.sortType}
          xScroll={this.state.xScroll}
          headerSizes={this.state.headerSizes}
          onClick={this.onItemClick.bind(this)}
          onDoubleClick={this.onItemDoubleClick.bind(this)}
          onItemDragStart={this.props.onItemDragStart}
          onItemDragEnter={this.props.onItemDragEnter}
          onItemDragLeave={this.props.onItemDragLeave}
          onItemDragOver={this.props.onItemDragOver}
          onItemDrop={this.props.onItemDrop}
        >
          {this.itemRows}
        </ItemArea>
      </Root>
    );
  }
  public componentDidMount(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.layout();
    });
    this.resizeObserver.observe(this.rootRef.current! as Element);
    this.layout();
  }
  public componentWillUnmount(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
  /**
   *レイアウト処理
   *
   * @protected
   * @memberof SplitView
   */
  protected layout(): void {
    this.setState({ clientWidth: this.rootRef.current!.clientWidth });
    if (this.rootRef.current) {
      this.rootRef.current.scrollLeft = 0;
    }
  }
  protected onHeaderClick(sortIndex: number): void {
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
  protected onItemClick(e: React.MouseEvent, row: number, col: number): void {
    const selectItems = this.state.selectItems;
    if (e.ctrlKey) {
      if (!selectItems.has(row)) selectItems.add(row);
      else selectItems.delete(row);
    } else if (e.shiftKey) {
      this.state.selectItems.add(row);
      const items = getSetValues(selectItems);
      let s = Math.min.apply(null, items);
      let e = Math.max.apply(null, items);
      for (let i = s; i <= e; i++) selectItems.add(i);
    } else {
      selectItems.clear();
      selectItems.add(row);
    }

    this.state.selectItems.add(row);
    this.setState({ selectItems: new Set(getSetValues(selectItems)) });

    if (this.props.onItemClick) {
      this.props.onItemClick(row, col);
    }
  }
  protected onItemDoubleClick(
    e: React.MouseEvent,
    row: number,
    col: number
  ): void {
    if (this.props.onItemDoubleClick) {
      this.props.onItemDoubleClick(row, col);
    }
  }
  /**
   *選択中の最初のアイテムを返す
   *
   * @returns 0<=:アイテム番号 -1:選択無し
   * @memberof ListView
   */
  public getSelectItem(): number {
    const selectItems = this.state.selectItems;
    if (selectItems.size) return getSetValues(selectItems)[0];
    return -1;
  }
  /**
   *選択中のアイテムを配列で返す
   *
   * @returns 選択中のアイテム番号の配列
   * @memberof ListView
   */
  public getSelectItems(): number[] {
    return getSetValues(this.state.selectItems);
  }
  /**
   *アイテムの内容を返す
   *
   * @param {number} row
   * @param {number} col
   * @returns {(React.ReactNode | undefined)} 内容
   * @memberof ListView
   */
  public getItem(row: number, col: number): React.ReactNode | undefined {
    const itemValues = this.itemsRef.current!.getItems();
    if (row >= itemValues.length) return undefined;
    return itemValues[row].labels[col];
  }
  /**
   *アイテムの内容を変更する
   *
   * @param {number} row
   * @param {number} col
   * @param {ReactNode} value
   * @memberof ListView
   */
  public setItem(row: number, col: number, value: ReactNode): void {
    this.manual = true;
    const itemValues = this.itemsRef.current!.getItems();
    if (row < itemValues.length) itemValues[row].labels[col] = value;
    this.forceUpdate();
  }

  /**
   *アイテムの値を返す
   *
   * @param {number} row
   * @returns unknown
   * @memberof ListView
   */
  public getItemValue(row: number):unknown {
    const itemValues = this.itemsRef.current!.getItems();
    if (row >= itemValues.length) return undefined;
    return itemValues[row].value;
  }

  /**
   *アイテム数を返す
   *
   * @returns
   * @memberof ListView
   */
  public getRows(): number {
    return this.itemsRef.current!.getItems().length;
  }
  /**
   *アイテムのカラム数を返す
   *
   * @returns
   * @memberof ListView
   */
  public getCols(): number {
    return this.state.headerSizes.length;
  }
  /**
   *アイテムの追加
   *
   * @param {ReactNode[]} item 追加するアイテム
   * @memberof ListView
   */
  public addItem(item: ItemRow | ReactNode[]): void {
    this.manual = true;
    if ("labels" in item) this.itemsRef.current!.addItem(item);
    else this.itemsRef.current!.addItem({ labels: item });
  }
  /**
   *アイテムの削除
   *
   * @param {number} row 削除するレコード番号
   * @memberof ListView
   */
  public removeItem(row: number): void {
    this.manual = true;
    this.itemsRef.current!.removeItem(row);
    this.state.selectItems.clear();
  }

}
