# @jswf/react

React用仮想Windowコンポーネント

## 内容

Reactで仮想ウインドウを実現するためのコンポーネント
JSWFWindowで囲むだけで、そこが仮想ウインドウ化します

## Screen Shot

![ScreenShot](https://raw.githubusercontent.com/JavaScript-WindowFramework/jwf-react-sample01/ScreenShot/ScreenShot.png)

## Sample source

```index.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import { JSWFWindow, WindowState, WindowStyle, WindowInfo } from "@jswf/react";

function App() {
  const frame = React.createRef<JSWFWindow>();
  const [info, setInfo] = React.useState<WindowInfo | null>(null);
  return (
    <>
      <JSWFWindow ref={frame} title="Window1" x={50} y={100}>
        この中に入れたコンテンツは仮想ウインドウ上に表示されます
      </JSWFWindow>

      <JSWFWindow
        title="Window2"
        width={600}
        height={500}
        windowStyle={~WindowStyle.CLOSE}
      >
        ウインドウ位置を設定しなかった場合、中央に表示されます
        <br />
        windowStyleで使用する機能を設定できます
        <JSWFWindow
          title="ChildWindow"
          overlapped={false}
          width={200}
          height={200}
        >
          overlappedをfalseにするとクライアント領域内に表示され、trueにすると重ね合わせだけ調整されます
        </JSWFWindow>
      </JSWFWindow>

      <JSWFWindow title="更新テスト" y={50} onUpdate={p => setInfo(p)}>
        <pre>{info && JSON.stringify(info,["realX","realY","realWidth","realHeight"],' ')}</pre>
      </JSWFWindow>

      <button
        onClick={() => {
          frame.current!.foreground();
          frame.current!.setWindowState(WindowState.NORMAL);
        }}
      >
        Window1を復活させる
      </button>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
```

### 現時点で使用可能な機能

- ウインドウの移動
- リサイズ
- 最大化
- 最小化
- 重ね合わせ
- 親子ウインドウ

## 関連リンク

- ソースコード  
[https://github.com/JavaScript-WindowFramework/jswf-react](https://github.com/JavaScript-WindowFramework/jswf-react)

- サンプルソース  
[https://github.com/JavaScript-WindowFramework/jwf-react-sample01](https://github.com/JavaScript-WindowFramework/jwf-react-sample01)

- 動作サンプル  
[https://javascript-windowframework.github.io/jwf-react-sample01/dist/](https://javascript-windowframework.github.io/jwf-react-sample01/dist/)

## ライセンス

MIT
