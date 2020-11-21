import * as React from "react";
import {
  JSWindow,
  ListView,
  SplitView,
  ListHeaders,
  ListHeader,
  ListRow,
  ListItem,
} from "@jswf/react";

export default {
  title: "Pages/ListView",
  component: ListView,
};

export const ListViewBasic = () => {
  let listViewRef = React.useRef<ListView>(null);
  const [message, setMessage] = React.useState("");
  let count = 1;
  return (
    <JSWindow width={600} title="ListViewの実装中">
      <SplitView>
        <div>
          <button
            onClick={() => {
              //アイテムを動的に追加
              listViewRef.current!.addItem([
                count++,
                <>
                  馬<br />糞
                </>,
                0,
                1,
              ]);
            }}
          >
            追加
          </button>
          <br />
          文字列と仮想DOMを追加
          <br />
          <br />
          <button
            onClick={() => {
              const items = listViewRef.current!.getSelectItems();
              for (const item of items)
                listViewRef.current!.setItem(item, 1, "馬糞");
            }}
          >
            変更
          </button>
          <br />
          選択したものを馬糞に変える
          <br />
          <br />
          <button
            onClick={() => {
              const items = listViewRef.current!.getSelectItems();
              items.sort((a, b) => b - a);
              for (const item of items) listViewRef.current!.removeItem(item);
            }}
          >
            削除
          </button>
          <br />
          選択したものを削除
          <br />
          <br />
          {message}
        </div>
        <ListView
          ref={listViewRef}
          draggable={true}
          onItemClick={(row, col) => {
            //アイテムの取得
            const item = listViewRef.current!.getItem(row, col);
            //クリックした場所のデータを読み出す
            if (item) setMessage(`「${item.toString()}」がクリックされました`);
          }}
        >
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
          <ListRow>
            <ListItem>{count++}</ListItem>
            <ListItem>竹槍</ListItem>
            <ListItem>5</ListItem>
            <ListItem>10</ListItem>
          </ListRow>
          <ListRow>
            <ListItem>{count++}</ListItem>
            <ListItem>棍棒</ListItem>
            <ListItem>10</ListItem>
            <ListItem>40</ListItem>
          </ListRow>
          <ListRow>
            <ListItem>{count++}</ListItem>
            <ListItem>銅の剣</ListItem>
            <ListItem>18</ListItem>
            <ListItem>120</ListItem>
          </ListRow>
          <ListRow>
            <ListItem>{count++}</ListItem>
            <ListItem>鉄の槍</ListItem>
            <ListItem>30</ListItem>
            <ListItem>380</ListItem>
          </ListRow>
          <ListRow>
            <ListItem>{count++}</ListItem>
            <ListItem>鉄の剣</ListItem>
            <ListItem>40</ListItem>
            <ListItem>700</ListItem>
          </ListRow>
        </ListView>
      </SplitView>
    </JSWindow>
  );
};
