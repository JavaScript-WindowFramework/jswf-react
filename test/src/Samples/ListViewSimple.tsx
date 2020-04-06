import * as React from "react";
import {
  JSWindow,
  ListView,
  ListHeaders,
  ListHeader,
  ListRow,
  ListItem,
} from "@jswf/react";

export function ListViewSimple() {
  let count = 1;
  return (
    <JSWindow width={600} title="ListViewSimple">
      <ListView>
        <ListHeaders>
          <ListHeader type="number">No</ListHeader>
          <ListHeader width={100}>武器の<br />名前</ListHeader>
          <ListHeader type="number">攻撃力</ListHeader>
          <ListHeader type="number">価格</ListHeader>
        </ListHeaders>
        <ListRow>
          <ListItem>{count++}</ListItem>
          <ListItem>竹槍</ListItem>
          <ListItem value={5}>5</ListItem>
          <ListItem>10</ListItem>
        </ListRow>
        <ListRow>
          <ListItem>{count++}</ListItem>
          <ListItem>銅の剣</ListItem>
          <ListItem value={18}>18</ListItem>
          <ListItem>120</ListItem>
        </ListRow>
        <ListRow>
          <ListItem>{count++}</ListItem>
          <ListItem>棍棒</ListItem>
          <ListItem value={10}>10</ListItem>
          <ListItem>40</ListItem>
        </ListRow>
        <ListRow>
          <ListItem>{count++}</ListItem>
          <ListItem>鉄の槍</ListItem>
          <ListItem value={30}>30</ListItem>
          <ListItem>380</ListItem>
        </ListRow>
        <ListRow>
          <ListItem>{count++}</ListItem>
          <ListItem>鉄の剣</ListItem>
          <ListItem value={40}>40</ListItem>
          <ListItem>700</ListItem>
        </ListRow>
      </ListView>
    </JSWindow>
  );
}
