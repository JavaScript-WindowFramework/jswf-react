import * as React from "react";
import { JSWindow } from "@jswf/react";

export function WindowChild() {
  return (
    <JSWindow title="Parent Window" width={800} height={600}>
      <JSWindow title="Child Window" overlapped={false}>親の中に表示される子ウインドウ</JSWindow>
      <JSWindow title="Overlap Child Window">外側に出られる子ウインドウ</JSWindow>
    </JSWindow>
  );
}
