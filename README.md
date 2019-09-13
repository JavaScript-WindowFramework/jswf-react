# @jswf/react

React用仮想Windowコンポーネント

## １．内容

Reactで仮想ウインドウを実現するためのコンポーネント
JSWindowで囲むだけで、そこが仮想ウインドウ化します

## ２．Screen shot

![ScreenShot](https://raw.githubusercontent.com/JavaScript-WindowFramework/jwf-react-sample01/ScreenShot/ScreenShot.gif)

## ３．links

- WebSite  
[https://ttis.croud.jp/?uuid=b292d429-dbad-49b5-8fed-6d268f4feaf0](https://ttis.croud.jp/?uuid=b292d429-dbad-49b5-8fed-6d268f4feaf0)

- Source code  
[https://github.com/JavaScript-WindowFramework/jswf-react](https://github.com/JavaScript-WindowFramework/jswf-react)

- Sample code  
[https://github.com/JavaScript-WindowFramework/jwf-react-sample01](https://github.com/JavaScript-WindowFramework/jwf-react-sample01)

- Operation sample  
[https://javascript-windowframework.github.io/jwf-react-sample01/dist/](https://javascript-windowframework.github.io/jwf-react-sample01/dist/)

## ４．Sample source

```tsx:index.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  JSWindow,
  WindowState,
  WindowStyle,
  WindowInfo,
  SplitView,
  SplitType
} from "@jswf/react";

function App() {
  const frame = React.createRef<JSWindow>();
  const [info, setInfo] = React.useState<WindowInfo | null>(null);
  const [type, setType] = React.useState<SplitType>("ew");
  return (
    <>
      {/* -------- 単純にウインドウを表示する ------------*/}
      <JSWindow ref={frame} title="Window1" x={50} y={100}>
        この中に入れたコンテンツは仮想ウインドウ上に表示されます
      </JSWindow>

      {/* -------- ウインドウの中にウインドウ ------------*/}
      <JSWindow title="Window2" width={600} height={500} windowStyle={~WindowStyle.CLOSE}>
        ウインドウ位置を設定しなかった場合、中央に表示されます
        <br />
        windowStyleで使用する機能を設定できます
        <JSWindow title="ChildWindow" overlapped={false} width={200} height={200}>
          overlappedをfalseにするとクライアント領域内に表示され、trueにすると重ね合わせだけ調整されます
        </JSWindow>
      </JSWindow>

      {/* -------- ウインドウの情報を表示 ------------*/}
      <JSWindow title="更新テスト" y={50} onUpdate={p => setInfo(p)}>
        <pre>
          {info &&
            JSON.stringify(
              info,
              ["realX", "realY", "realWidth", "realHeight"],
              " "
            )}
        </pre>
      </JSWindow>

      {/* -------- 分割バーの設置 ------------*/}
      <JSWindow width={500} height={400} title="分割バー" clientStyle={{ display: "flex", flexDirection: "column" }}>
        {/* ボタン設置 */}
        <div style={{ borderBottom: "solid 2px" }}>
          <button onClick={() => setType("we")}>WE</button>
          <button onClick={() => setType("ew")}>EW</button>
          <button onClick={() => setType("ns")}>NS</button>
          <button onClick={() => setType("sn")}>SN</button>
        </div>
        {/* 分割バー(デフォルトスタイルは親のクライアント領域の最大まで広がる) */}
        <SplitView type={type} style={{ position: "relative", flex: 1 }}>
          <div style={{ height: "100%" }}>アクティブ側</div>
          <div style={{ height: "100%", backgroundColor: "rgb(230,255,255)" }}>
            スタティック側
          </div>
        </SplitView>
      </JSWindow>

      {/* -------- 非ウインドウの通常ボタン ------------*/}
      <button onClick={() => {
          frame.current!.foreground();
          frame.current!.setWindowState(WindowState.NORMAL);
        }}>
        Window1を復活させる
      </button>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);

```

## ５．機能に関して

### 5.1 現時点で使用可能な機能

- ウインドウの移動
- リサイズ
- 最大化
- 最小化
- 重ね合わせ
- 親子ウインドウ
- 画面分割
- リストビュー

## ６．コンポーネント

### 6.1 **JSWindow**

#### Propsパラメータ

| Name        | Type               | Info                                                       |
| ----------- | ------------------ | ---------------------------------------------------------- |
| x           | number &#124; null | X Position                                                 |
| y           | number &#124; null | Y Position                                                 |
| width       | number             | Width                                                      |
| height      | number             | Height                                                     |
| moveable    | boolean            | trueだとクライアント領域のドラッグで移動                      |
| borderSize  | number             | サイズ変更用の見えないフレームのサイズ                        |
| titleSize   | number             | タイトルバーのサイズ                                         |
| title       | string             | タイトル                                                    |
| active      | boolean            | trueでアクティブ                                            |
| overlapped  | boolean            | falseにするとウインドウが親ウインドウ内にのみ表示              |
| windowStyle | number             | WindowStyle ビットの込み合わせ <br> TITLE:タイトルバー<br> MAX:最大化ボタン<br> MIN:最小化ボタン<br> CLOSE:クローズボタン<br> FRAME:枠の表示<br> RESIZE:サイズ変更<br> |
| windowState | WindowState                    | WindowState　ウインドウの状態<br>  NORMAL:通常<br> MAX:最大化<br> MIN:最小化<br> HIDE:非表示<br> |
| clientStyle | React.CSSProperties | クライアント領域に適用するスタイル |
| onUpdate    | function(p:WindowInfo)  &#124; null | ウインドウの状態が変化するとコールバックされる |

#### メソッド

- foreground()  
ウインドウをフォアグラウンドにする

- setWindowState(state: WindowState | undefined)  
ウインドウの状態を変更する  
  - state  
WindowState.NORMAL  
WindowState.MAX  
WindowState.MIN  
WindowState.HIDE  

### 6.2 **SplitView**

#### Propsパラメータ

| Name        | Type                | Info                                                       |
| ----------- | ------------------- | ---------------------------------------------------------- |
| type        | SplitType           | ns,sn,we,ew                                                |
| pos         | number              | BarPosition                                                |
| activeSize  | number              | SlideModeSize -1:NotUse 0:always                           |
| activeWait  | number              | SlideTime (ms)                                             |
| bold        | number              | Bar thickness                                              |
| style       | React.CSSProperties | CSS                                                        |

## ７．ライセンス

MIT
