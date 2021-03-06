import * as React from "react";
import {
  JSWindow,
  SplitView,
  TreeView,
  TreeItem,
  TreeItemStyle,
} from "@jswf/react";

export default {
  title: "Pages/TreeView",
  component: TreeView,
};

export const TreeViewBasic = ()=> {
  const treeViewRef = React.useRef<TreeView>(null);
  const [message, setMessage] = React.useState<React.ReactNode>();
  return (
    <JSWindow width={600} title="TreeView">
      <SplitView>
        <div>
          <button
            onClick={() => {
              const item = treeViewRef.current!.getSelectItem();
              if (item) item.addItem({ label: "追加" });
            }}
          >
            追加
          </button>
          <br />
          <br />
          <button
            onClick={() => {
              const item = treeViewRef.current!.getSelectItem();
              if (item) item.remove();
            }}
          >
            選択を削除
          </button>
          <br />
          <br />
          <button
            onClick={() => {
              const items = treeViewRef.current!.getCheckItems();
              for (const item of items) item.remove();
            }}
          >
            チェックを削除
          </button>
          <br />
          <br />
          <button
            onClick={() => {
              const item = treeViewRef.current!.findItem("d");
              item?.select();
            }}
          >
            Data4を選択
          </button>
          <br />
          <br />
          {message}
        </div>

        <TreeView
          itemStyle={TreeItemStyle.CHECKBOX}
          ref={treeViewRef}
          draggable={true}
          onItemClick={(item) => setMessage(item.getLabel())}
        >
          <TreeItem label="Root" value="a">
            <TreeItem label="Data2" value="b">
              <TreeItem label="Data3" value="c">
                <TreeItem label="Data4" value="d" />
              </TreeItem>
            </TreeItem>
            <TreeItem label={<b>太字</b>}>
              <TreeItem
                label={
                  <>
                    改行を
                    <br />
                    含む
                  </>
                }
              ></TreeItem>
            </TreeItem>
            <TreeItem label={<input defaultValue="TextBoxも入る" />} />
          </TreeItem>
        </TreeView>
      </SplitView>
    </JSWindow>
  );
}
