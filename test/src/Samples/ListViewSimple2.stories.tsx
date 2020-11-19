import * as React from "react";
import {
  JSWindow,
  ListView,
  ListHeaders,
  ListHeader,
  ListRow,
  ListItem,
} from "@jswf/react";

export default {
  title: "Pages/ListView",
  component: ListView,
};

interface ItemType {
  name: string;
  value: number;
  cost: number;
}

const items: ItemType[] = [
  { name: "竹槍", value: 5, cost: 10 },
  { name: "銅の剣", value: 18, cost: 120 },
  { name: "竹槍", value: 5, cost: 10 },
  { name: "棍棒", value: 10, cost: 40 },
  { name: "鉄の槍", value: 30, cost: 380 },
  { name: "鉄の剣", value: 40, cost: 700 },
];

export const ListViewSimple2 = () => (
  <JSWindow width={600} title="ListViewSimple">
    <ListView>
      <ListHeaders>
        <ListHeader type="number">No</ListHeader>
        <ListHeader width={100}>
          武器の
          <br />
          名前
        </ListHeader>
        <ListHeader type="number">攻撃力</ListHeader>
        <ListHeader type="number">価格</ListHeader>
      </ListHeaders>
      {items.map((item, index) => (
        <ListRow key={index}>
          <ListItem>{index}</ListItem>
          <ListItem>{item.name}</ListItem>
          <ListItem value={item.value}>{item.value}</ListItem>
          <ListItem value={item.cost}>{item.cost}</ListItem>
        </ListRow>
      ))}
    </ListView>
  </JSWindow>
);
