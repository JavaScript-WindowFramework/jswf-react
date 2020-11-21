import * as React from "react";
import { JSWindow } from "@jswf/react";

export default {
  title: "Pages/Window",
  component: Window,
};

export const WindowBasic = () => (
  <JSWindow
    title="WindowBasic"
    x={100}
    y={100}
    width={600}
    height={400}
    titleSize={64}
    moveable={true}
    clientStyle={{ backgroundColor: "#CCFFCC" }}
  >
    <pre>
      {`
        title="WindowBasic"
        x={100}
        y={100}
        width={600}
        height={400}
        titleSize={64}
        moveable={true}
        clientStyle={{ backgroundColor: "#CCFFCC" }}`}
    </pre>
  </JSWindow>
);
