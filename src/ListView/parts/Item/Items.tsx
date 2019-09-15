import styled from "styled-components";
import React, {
  Component,
  ReactNode,
  RefObject,
  ReactElement,
  createRef,
  ReactComponentElement
} from "react";
import { Root } from "./Root";
import { Item } from "./Item";
import imgFile from "../../../../images/file.png";
import { ListViewDragData } from "../../";
import { ListRow } from "../../DomDefinition";

interface ItemColumnProps {
  width: number;
}
const ItemColumn = styled.div.attrs<ItemColumnProps>(p => ({
  style: { width: p.width + "px" }
}))<ItemColumnProps>`
  display: inline-block;
  vertical-align: top;
`;

interface ItemsProps {
  xScroll: number;
  draggable: boolean;
  headerSizes: number[];
  headerTypes: string[];
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
  labels: ReactNode[];
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

  public componentDidUpdate() {
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
  public componentDidMount() {
    this.fileImage = document.createElement("img");
    this.fileImage.src = imgFile;
    this.fileImage.style.height = "64px";

    const itemRows: ItemRow[] = [];
    for (const itemRow of this.props.children) {
      itemRows.push({
        value: itemRow.props.value,
        labels: React.Children.map(
          itemRow.props.children as ReactElement,
          item => item.props.children
        )
      });
    }

    this.itemRows = itemRows;
    this.setState({ itemRows: this.itemRows });
    this.sort();
  }

  public render() {
    if (
      this.sortOrder !== this.props.sortOrder ||
      this.sortIndex !== this.props.sortIndex
    ) {
      this.sortOrder = this.props.sortOrder;
      this.sortIndex = this.props.sortIndex;
      setTimeout(() => {
        this.sort();
      });
    }
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
                      <div>{itemRow.labels[cols]}</div>
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
    const sortOrder = this.props.sortOrder;
    if (this.props.sortType === "number") {
      this.itemRows.sort((a, b) => {
        if (sortOrder)
          return (
            parseFloat(a.labels[sortIndex]! as string) -
            parseFloat(b.labels[sortIndex]! as string)
          );
        else
          return (
            parseFloat(b.labels[sortIndex]! as string) -
            parseFloat(a.labels[sortIndex]! as string)
          );
      });
    } else {
      this.itemRows.sort((a, b) => {
        if (sortOrder)
          return a.labels[sortIndex]! <= b.labels[sortIndex]! ? -1 : 1;
        else return a.labels[sortIndex]! < b.labels[sortIndex]! ? 1 : -1;
      });
    }
    this.setState({ itemRows: this.itemRows });
  }

  protected onDragStart(e: React.DragEvent, row: number, col: number) {
    if (!this.props.selectItems.has(row)) {
      e.preventDefault();
      return;
    }
    if (this.props.onItemDragStart) this.props.onItemDragStart(e, row, col);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(this.fileImage!, 10, 10);
    const rows = Array.from(this.props.selectItems.values());
    const items = rows.map(item => {
      return this.itemRows[item];
    });

    const value: ListViewDragData = { type: "ListViewDragData", items };
    e.dataTransfer.setData("text/plain", JSON.stringify(value));
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

  public getItemValues() {
    return this.state.itemRows;
  }
  public addItem(item:ItemRow) {
    this.itemRows.push(item);
    this.setState({ itemRows: this.itemRows });
  }
  public removeItem(row: number) {
    this.itemRows.splice(row, 1);
    this.setState({ itemRows: this.itemRows });
  }
}
