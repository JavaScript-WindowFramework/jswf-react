import * as React from "react";
import { JSWindow, SplitType, SplitView } from "@jswf/react";

export function SplitViewBasic() {
  const [type, setType] = React.useState<SplitType>("ew");
  return (
    <JSWindow
      width={500}
      height={400}
      title="SplitViewBasic"
      clientStyle={{ display: "flex", flexDirection: "column" }}
    >
      {/* Button installation */}
      <div style={{ borderBottom: "solid 2px" }}>
        <button onClick={() => setType("we")}>WE</button>
        <button onClick={() => setType("ew")}>EW</button>
        <button onClick={() => setType("ns")}>NS</button>
        <button onClick={() => setType("sn")}>SN</button>
      </div>
      {/* Split bar (default style extends to the maximum of the parent client area) */}
      <SplitView type={type} style={{ position: "relative", flex: 1 }}>
        <div style={{ height: "100%" }}>Active side</div>
        <div style={{ height: "100%", backgroundColor: "rgb(230,255,255)" }}>
          Static side
        </div>
      </SplitView>
    </JSWindow>
  );
}
