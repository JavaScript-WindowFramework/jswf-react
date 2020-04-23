import * as React from "react";
import { JSWindow } from "@jswf/react";

import { storiesOf } from "@storybook/react";

storiesOf("Pages/Window", module).add("WindowSimple", () => {
  return <WindowSimple />;
});

export function WindowSimple() {
  return <JSWindow title="WindowSimple">Simple Window</JSWindow>;
}
