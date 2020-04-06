import React, {
  Component,
  ReactNode,
  RefObject,
  ReactElement,
  createRef,
  ReactComponentElement
} from "react";
import { ListViewDragData, ListView } from "..";
import { ListRow, ListItem } from "../ExportDefinition";
import { ItemColumn, Root, Item } from "./Items.style";
import imgFile from "../../../images/file.png";

interface ItemsProps {
  listView: ListView;
  xScroll: number;
  draggable: boolean;
  headerSizes: number[];
  headerTypes: ("string" | "number")[];
  children: ReactComponentElement<typeof ListRow>[];
  sortOrder?: boolean;
  sortIndex?: number;
  sortType?: string;
  selectItems: Set<number>;
  onClick: (e: React.MouseEvent, row: number, col: number) => void;
  onDoubleClick: (e: React.MouseEvent, row: number, col: number) => void;
  onItemDragStart?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragEnter?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragLeave?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDragOver?: (e: React.DragEvent, row: number, col: number) => void;
  onItemDrop?: (e: React.DragEvent, row: number, col: number) => void;
}
export interface ItemRow {
  value?: unknown;
  items: { label: ReactNode; value?: unknown }[];
}

interface State {
  itemRows: ItemRow[];
}

export class ItemArea extends Component<ItemsProps, State> {
  state: State = { itemRows: [] };
  private rootRef: RefObject<HTMLDivElement> = createRef();
  private columnsRef: RefObject<HTMLDivElement>[] = [];
  private itemsRef: RefObject<HTMLDivElement>[][] = [];
  private sortOrder?: boolean;
  private sortIndex?: number;
  private itemRows: ItemRow[] = [];
  private fileImage?: HTMLImageElement;
  private sortFlag = true;

  public componentDidUpdate() {
    if (
      this.sortFlag ||
      this.sortOrder !== this.props.sortOrder ||
      this.sortIndex !== this.props.sortIndex
    ) {
      this.sortOrder = this.props.sortOrder;
      this.sortIndex = this.props.sortIndex;
      this.sortFlag = false;

      this.sort();
    }

    //カラムのスクロールバー幅修正
    if (this.columnsRef.length) {
      const rootWidth = this.rootRef.current!.clientWidth + this.props.xScroll;
      const columnWidth = this.columnsRef.reduce((a, b) => {
        return a - b.current!.offsetWidth;
      }, rootWidth);
      if (columnWidth) {
        const node = this.columnsRef[this.columnsRef.length - 1].current!;
        node.style.width = node.offsetWidth + columnWidth + "px";
      }
    }

    //アイテム選択と高さ設定
    this.itemsRef.forEach((row, index) => {
      let height = row.reduce((a, b) => {
        return Math.max(
          a,
          (b.current!.childNodes[0] as HTMLDivElement).offsetHeight
        );
      }, 0);
      const select = this.props.selectItems.has(index);
      row.forEach(item => {
        if (select) item.current!.classList.add("Select");
        else item.current!.classList.remove("Select");
        item.current!.style.height = height + "px";
      });
    });
  }
  shouldComponentUpdate(props: ItemsProps) {
    if (this.props.children !== props.children) {
      if (!props.listView.isManual()) this.createItem(props);
    }
    return true;
  }
  private createItem(props: ItemsProps) {
    const itemRows: ItemRow[] = [];
    React.Children.map(props.children, itemRow => {
      const items: ItemRow["items"] = [];

      React.Children.forEach(itemRow.props.children as ReactElement, item => {
        if (item.type === ListItem) {
          const label: ReactNode =
            React.Children.count(item.props.children) === 1 ? (
              item.props.children
            ) : (
              <>{item.props.children}</>
            );
          items.push({ label, value: item.props.value });
        }
      });

      itemRows.push({
        value: itemRow.props.value,
        items
      });
    });
    this.itemRows = itemRows;
    this.setState({ itemRows: itemRows });
    this.sortFlag = true;
  }
  public componentDidMount() {
    this.fileImage = document.createElement("img");
    this.fileImage.src = imgFile;
    this.fileImage.style.height = "64px";

    this.createItem(this.props);
  }

  public render() {
    this.itemsRef = [];
    this.columnsRef = [];
    return (
      <Root
        ref={this.rootRef}
        left={this.props.xScroll}
        onDragOver={e => e.preventDefault()}
      >
        <div style={{ position: "relative", left: -this.props.xScroll }}>
          {this.props.headerSizes.map((size, cols) => {
            this.columnsRef[cols] = createRef();
            return (
              <ItemColumn ref={this.columnsRef[cols]} key={cols} width={size}>
                {this.state.itemRows.map((itemRow, rows) => {
                  const ref = createRef<HTMLDivElement>();
                  if (this.itemsRef[rows]) this.itemsRef[rows][cols] = ref;
                  else this.itemsRef[rows] = [ref];
                  let type = "flex-start";
                  if (this.props.headerTypes[cols] === "number")
                    type = "flex-end";
                  return (
                    <Item
                      ref={ref}
                      key={rows}
                      widthPos={type}
                      draggable={this.props.draggable}
                      onMouseOver={() => {
                        this.onOver(rows, true);
                      }}
                      onMouseLeave={() => {
                        this.onOver(rows, false);
                      }}
                      onClick={e => {
                        this.props.onClick(e, rows, cols);
                      }}
                      onDoubleClick={e => {
                        this.props.onDoubleClick(e, rows, cols);
                      }}
                      onDragStart={e => {
                        this.onDragStart(e, rows, cols);
                      }}
                      onDragLeave={e => {
                        this.onDragLeave(e, rows, cols);
                      }}
                      onDragEnter={e => {
                        this.onDragEnter(e, rows, cols);
                      }}
                      onDragOver={e => {
                        this.onDragOver(e, rows, cols);
                      }}
                      onDrop={e => {
                        this.onDrop(e, rows, cols);
                      }}
                    >
                      <div>{itemRow.items[cols].label}</div>
                    </Item>
                  );
                })}
              </ItemColumn>
            );
          })}
        </div>
      </Root>
    );
  }
  protected onOver(index: number, flag: boolean) {
    const rows = this.itemsRef[index];
    for (const item of rows) {
      if (flag) item.current!.classList.add("Hover");
      else item.current!.classList.remove("Hover");
    }
  }
  protected sort() {
    const sortIndex = this.props.sortIndex;
    if (sortIndex === undefined || sortIndex < 0) return;
    const sortOrder = this.props.sortOrder ? 1 : -1;

    this.itemRows.sort((a, b) => {
      const va = a.items[sortIndex].value as never;
      const vb = b.items[sortIndex].value as never;
      if (
        va !== undefined &&
        vb !== undefined
      ) {
        return (this.props.sortOrder?va < vb:vb<va)?-1:1;
      } else {
        const va = a.items[sortIndex].label as string;
        const vb = b.items[sortIndex].label as string;
        if (this.props.sortType === "number") {
          const va2 = parseFloat(va);
          const vb2 = parseFloat(vb);
          return (va2 - vb2) * sortOrder;
        } else {
          if (va === vb) return 0;
          return (va < vb ? -1 : 1) * sortOrder;
        }
      }
    });

    this.setState({ itemRows: this.itemRows });
  }

  protected onDragStart(e: React.DragEvent, row: number, col: number) {
    //選択されていなければ終了
    if (!this.props.selectItems.has(row)) {
      return;
    }
    //コールバックイベントを呼ぶ
    if (this.props.onItemDragStart) this.props.onItemDragStart(e, row, col);
    //イベントがキャンセルされていなければ転送データを修正
    if (!e.defaultPrevented) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(this.fileImage!, 10, 10);
      const rows = Array.from(this.props.selectItems.values());
      const items = rows.map(item => {
        return this.itemRows[item];
      });

      const value: ListViewDragData = {
        type: this.props.listView.props.dragString!,
        items
      };
      e.dataTransfer.setData("text/plain", JSON.stringify(value));
    }
  }
  protected onDragLeave(e: React.DragEvent, row: number, col: number) {
    if (this.props.onItemDragLeave) this.props.onItemDragLeave(e, row, col);
  }
  protected onDragEnter(e: React.DragEvent, row: number, col: number) {
    if (this.props.onItemDragEnter) this.props.onItemDragEnter(e, row, col);
    e.preventDefault();
  }
  protected onDragOver(e: React.DragEvent, row: number, col: number) {
    if (this.props.onItemDragOver) this.props.onItemDragOver(e, row, col);
    e.preventDefault();
  }
  protected onDrop(e: React.DragEvent, row: number, col: number) {
    if (this.props.onItemDrop) this.props.onItemDrop(e, row, col);
    e.preventDefault();
  }

  public getItems() {
    return this.state.itemRows;
  }
  public addItem(item: ItemRow) {
    this.itemRows.push(item);
    this.setState({ itemRows: this.itemRows });
  }
  public removeItem(row: number) {
    this.itemRows.splice(row, 1);
    this.setState({ itemRows: this.itemRows });
  }
}
