/**
 *位置設定用
 *
 * @export
 * @interface Point
 */
export interface Point {
  x: number;
  y: number;
}
/**
 * サイズ設定用
 */
export interface Size {
  width: number;
  height: number;
}
/**
 * ドラッグドロップ機能用
 *
 * @export
 * @interface MovePoint
 * @param {Point} basePoint クリック基準位置
 * @param {Point} nowPoint 移動位置位置
 * @param {Point} nodePoint ノード初期位置
 * @param {Size} nodeSize ノード初期サイズ
 */
export interface MovePoint {
  event: MouseEvent | TouchEvent;
  basePoint: Point;
  nowPoint: Point;
  nodePoint: Point;
  nodeSize: Size;
}
export interface JWFEvent extends Event {
  params?: unknown;
}
/**
 * ウインドウ等総合管理クラス
 *
 * @export
 * @class Jwf
 */
export class Manager {
  public static nodeX: number;
  public static nodeY: number;
  public static baseX: number;
  public static baseY: number;
  public static nodeWidth: number;
  public static nodeHeight: number;
  public static moveNode: HTMLElement | null = null;
  public static frame: string | null = null;

  /**
   * マウスとタッチイベントの座標取得処理
   * @param  {MouseEvent|TouchEvent} e
   * @returns {Point} マウスの座標
   */
  public static getPos(e: MouseEvent | TouchEvent): Point {
    let p: Point;
    if (
      (e as TouchEvent).targetTouches &&
      (e as TouchEvent).targetTouches.length
    ) {
      let touch = (e as TouchEvent).targetTouches[0];
      p = { x: touch.pageX, y: touch.pageY };
    } else {
      p = { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    }
    return p;
  }
  /**
   * 対象ノードに対して移動を許可し、イベントを発生させる
   *
   * @static
   * @param {HTMLElement} node
   * @memberof Jwf
   */
  public static enableMove(node: HTMLElement): void {
    function mouseDown(e: MouseEvent | TouchEvent) {
      if (Manager.moveNode == null) {
        Manager.moveNode = node;
        let p = Manager.getPos(e);
        Manager.baseX = p.x;
        Manager.baseY = p.y;
        Manager.nodeX = node.offsetLeft;
        Manager.nodeY = node.offsetTop;
        Manager.nodeWidth = node.clientWidth;
        Manager.nodeHeight = node.clientWidth;
        //e.preventDefault();
       // return false;
      }
     // return true;
    }
    node.addEventListener("touchstart", mouseDown, { passive: false });
    node.addEventListener("mousedown", mouseDown);
  }
  /**
   * ノードに対してイベントを発生させる
   *
   * @static
   * @param {HTMLElement} node 対象ノード
   * @param {string} ename イベント名
   * @param {*} [params] イベント発生時にevent.paramsの形で送られる
   * @memberof Jwf
   */
  public static callEvent(
    node: HTMLElement,
    ename: string,
    params?: unknown
  ): void {
    node.dispatchEvent(Manager.createEvent(ename, params));
  }
  /**
   *イベントを作成する
   *
   * @static
   * @param {string} ename イベント名
   * @param {*} [params] イベント発生時にevent.paramsの形で送られる
   * @returns {Event} 作成したイベント
   * @memberof Jwf
   */

  private static createEvent(ename: string, params?: unknown): Event {
    let event: CustomEvent & { params?: unknown };
    try {
      event = new CustomEvent(ename);
    } catch (e) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(ename, false, false, null);
    }
    if (params) event.params = params;
    return event;
  }
  /**
   *ノードを作成する
   *
   * @static
   * @param {string} tagName タグ名
   * @param {*} [params] タグパラメータ
   * @returns {HTMLElement} 作成したノード
   * @memberof Jwf
   */
  public static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    params?: object
  ): HTMLElementTagNameMap[K] {
    let tag: HTMLElementTagNameMap[K] = document.createElement(tagName);
    if (params) {
      for (let index in params) {
        let p = params[index as keyof object];
        if (typeof p == "object" && p) {
          for (let index2 of Object.keys(p))
            tag[index as keyof typeof tag][index2 as keyof object] =
              p[index2 as keyof object];
        } else
          tag[index as keyof typeof tag] = p as typeof tag[keyof typeof tag];
      }
    }
    return tag;
  }
}
function mouseDown(e: MouseEvent | TouchEvent) {
  let node = e.target as HTMLElement;
  do {
    if (node.dataset && node.dataset.jwf === "Window") {
      //return true;
    }
  } while ((node = node.parentNode as HTMLElement));
  //return false;
}

//マウスが離された場合に選択をリセット
function mouseUp(): void {
  Manager.moveNode = null;
  Manager.frame = null;
}
//マウス移動時の処理
function mouseMove(e: MouseEvent | TouchEvent): void {
  if (Manager.moveNode) {
    let node = Manager.moveNode; //移動中ノード
    let p = Manager.getPos(e); //座標の取得
    let params: MovePoint = {
      event: e,
      nodePoint: { x: Manager.nodeX, y: Manager.nodeY },
      basePoint: { x: Manager.baseX, y: Manager.baseY },
      nowPoint: { x: p.x, y: p.y },
      nodeSize: { width: node.clientWidth, height: node.clientHeight }
    };
    Manager.callEvent(node, "move", params);
  }
}
addEventListener("mouseup", mouseUp, false);
addEventListener("touchend", mouseUp, { passive: false });
addEventListener("mousemove", mouseMove, false);
addEventListener("touchmove", mouseMove, { passive: false });
addEventListener("touchstart", mouseDown, { passive: false });
addEventListener("mousedown", mouseDown, false);
