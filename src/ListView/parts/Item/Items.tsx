import styled from "styled-components";
import React, {
  Component,
  ReactNode,
  RefObject,
  ReactElement,
  createRef
} from "react";
import { Root } from "./Root";
import { Item } from "./Item";
import imgFile from "../../../../images/file.png";

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
  headerSizes: number[];
  headerTypes: string[];
  children: ReactNode;
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
interface State {
  values: ReactNode[][];
}

export class Items extends Component<ItemsProps, State> {
  state: State = { values: [] };
  private rootRef: RefObject<HTMLDivElement> = createRef();
  private columnsRef: RefObject<HTMLDivElement>[] = [];
  private itemsRef: RefObject<HTMLDivElement>[][] = [];
  private sortOrder?: boolean;
  private sortIndex?: number;
  private values: ReactNode[][] = [];
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

    const values: ReactNode[][] = [];
    React.Children.forEach(this.props.children, children => {
      const value: ReactNode[] = [];
      values.push(value);

      React.Children.forEach(
        (children as ReactElement).props!.children,
        item => {
          value.push(item.props!.children);
        }
      );
    });
    this.values = values;
    this.setState({ values: this.values });
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
      <Root ref={this.rootRef} left={this.props.xScroll} onDragOver={e=>e.preventDefault()}>
        <div style={{ position: "relative", left: -this.props.xScroll }}>
          {this.props.headerSizes.map((size, cols) => {
            this.columnsRef[cols] = createRef();
            return (
              <ItemColumn ref={this.columnsRef[cols]} key={cols} width={size}>
                {this.state.values.map((items, rows) => {
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
                      draggable={true}
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
                      <div>{items[cols]}</div>
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
      this.values.sort((a, b) => {
        if (sortOrder)
          return (
            parseFloat(a[sortIndex]! as string) -
            parseFloat(b[sortIndex]! as string)
          );
        else
          return (
            parseFloat(b[sortIndex]! as string) -
            parseFloat(a[sortIndex]! as string)
          );
      });
    } else {
      this.values.sort((a, b) => {
        if (sortOrder) return a[sortIndex]! <= b[sortIndex]! ? -1 : 1;
        else return a[sortIndex]! < b[sortIndex]! ? 1 : -1;
      });
    }
    this.setState({ values: this.values });
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
    const items = rows.map((item)=>{
      return this.values[item];
    })
    e.dataTransfer.setData("text/plain",JSON.stringify(items));
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
    return this.state.values;
  }
  public addItem(item: ReactNode[]) {
    this.values.push(item);
    this.setState({ values: this.values });
  }
  public removeItem(row: number) {
    this.values.splice(row, 1);
    this.setState({ values: this.values });
  }
}
