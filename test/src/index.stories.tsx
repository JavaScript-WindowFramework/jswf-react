import * as React from "react";
import { storiesOf } from "@storybook/react";
import { WindowBasic } from "./Samples/WindowBasic";
import { WindowSimple } from "./Samples/WindowSimple";
import { WindowChild } from "./Samples/WindowChild";
import { SplitViewSimple } from "./Samples/SplitViewSimple";
import { SplitViewBasic } from "./Samples/SplitViewBasic";
import { ListViewSimple } from "./Samples/ListViewSimple";
import { ListViewBasic } from "./Samples/ListViewBasic";
import { TreeViewSimple } from "./Samples/TreeViewSimple";
import { TreeViewBasic } from "./Samples/TreeViewBasic";
import { CompornentList } from ".";

storiesOf("Pages", module)
  .add("index", () => {
    return <CompornentList />;
  })
  .add("WindowSimple", () => {
    return <WindowSimple />;
  })
  .add("WindowBasic", () => {
    return <WindowBasic />;
  })
  .add("WindowChild", () => {
    return <WindowChild />;
  })
  .add("SplitViewSimple", () => {
    return <SplitViewSimple />;
  })
  .add("SplitViewBasic", () => {
    return <SplitViewBasic />;
  })
  .add("ListViewSimple", () => {
    return <ListViewSimple />;
  })
  .add("ListViewBasic", () => {
    return <ListViewBasic />;
  })
  .add("TreeViewSimple", () => {
    return <TreeViewSimple />;
  })
  .add("TreeViewBasic", () => {
    return <TreeViewBasic />;
  });
