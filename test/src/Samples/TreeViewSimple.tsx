import * as React from "react";
import {
  JSWindow,
  TreeView,
  TreeItem
} from "@jswf/react";

export function TreeViewSimple() {
  return (
    <JSWindow title="TreeViewSimple">
      <TreeView>
        <TreeItem label="Root">
          <TreeItem label="Data2">
            <TreeItem label="Data3">
              <TreeItem label="Data4"></TreeItem>
            </TreeItem>
          </TreeItem>
          <TreeItem label={<b>太字</b>}>
            <TreeItem label={<>改行を<br />含む</>}/>
          </TreeItem>
          <TreeItem label={<input defaultValue="TextBoxも入る" />} />
        </TreeItem>
      </TreeView>
    </JSWindow>
  );
}
