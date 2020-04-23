import * as React from "react";
import { JSWindow, SplitView } from "@jswf/react";
import { storiesOf } from "@storybook/react";

storiesOf("Pages/SplitView", module).add("SplitViewSimple", () => {
  return <SplitViewSimple />;
});

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
