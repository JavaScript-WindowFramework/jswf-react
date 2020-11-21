import { JSWindow } from "@jswf/react";
import React from "react";

export default {
  title: "Pages/Window",
  component: JSWindow,
};

export const WindowSimple = () => (
  <JSWindow title="WindowSimple">Simple Window</JSWindow>
);
