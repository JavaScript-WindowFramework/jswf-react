import * as React from "react";
import { JSWindow, SplitView } from "@jswf/react";

export function SplitViewSimple() {
  return (
    <JSWindow title="SplitViewSimple">
      <SplitView>
        <div>アクティブ側</div>
        <div>スタティック側</div>
      </SplitView>
    </JSWindow>
  );
}
