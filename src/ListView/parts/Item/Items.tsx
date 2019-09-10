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
  selectItems: Set<Number>;
  onClick: (e: React.MouseEvent, row: number, col: number) => void;
  onDoubleClick: (e: React.MouseEvent, row: number, col: number) => void;
}
interface State {
  values: ReactNode[][];
}

export class Items extends Component<ItemsProps, State> {
  state: State = { values: [] };
  items: RefObject<HTMLDivElement>[][] = [];
  sortOrder?: boolean;
  sortIndex?: number;
  values: ReactNode[][] = [];

  componentDidUpdate() {
    this.items.forEach((row, index) => {
      let height = row.reduce((a, b) => {
        return Math.max(a, b.current!.offsetHeight);
      }, 0);
      const select = this.props.selectItems.has(index);
      row.forEach(item => {
        if (select) item.current!.classList.add("Select");
        else item.current!.classList.remove("Select");
        item.current!.style.height = height + "px";
      });
    });
  }
  componentDidMount() {
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

  render() {
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

    this.items = [];
    return (
      <Root left={this.props.xScroll}>
        <div style={{ position: "relative", left: -this.props.xScroll }}>
          {this.props.headerSizes.map((size, cols) => {
            return (
              <ItemColumn key={cols} width={size}>
                {this.state.values.map((items, rows) => {
                  const ref = createRef<HTMLDivElement>();
                  if (this.items[rows]) this.items[rows][cols] = ref;
                  else this.items[rows] = [ref];
                  let type = "flex-start";
                  if(this.props.headerTypes[cols] === "number")
                    type="flex-end";
                  return (
                    <Item
                      ref={ref}
                      key={rows}
                      widthPos={type}
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
                    >
                      {items[cols]}
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
  onOver(index: number, flag: boolean) {
    const rows = this.items[index];
    for (const item of rows) {
      if (flag) item.current!.classList.add("Hover");
      else item.current!.classList.remove("Hover");
    }
  }
  sort() {
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
  getItemValues() {
    return this.state.values;
  }
  addItem(item: ReactNode[]) {
    this.values.push(item);
    this.setState({ values: this.values });
  }
  removeItem(row: number) {
    this.values.splice(row, 1);
    this.setState({ values: this.values });
  }
}
