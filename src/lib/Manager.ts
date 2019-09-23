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
  distance?: number;
  radian?: number;
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
  public static pinchiBaseDistance?: number;

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

//マウスが離された場合に選択をリセット
function mouseUp(): void {
  Manager.moveNode = null;
  Manager.frame = null;
}
//マウス移動時の処理
function mouseMove(e: MouseEvent | TouchEvent): void {
  if (Manager.moveNode) {
    if ("touches" in e && e.touches.length === 2) {
      if (Manager.pinchiBaseDistance === undefined) {
        Manager.pinchiBaseDistance = getDistance(e.touches);
      } else {
        let node = Manager.moveNode; //移動中ノード
        let p = Manager.getPos(e); //座標の取得
        const distance = getDistance(e.touches) - Manager.pinchiBaseDistance;
        const radian = getRadian(e.touches);
        let params: MovePoint = {
          event: e,
          nodePoint: { x: Manager.nodeX, y: Manager.nodeY },
          basePoint: { x: Manager.baseX, y: Manager.baseY },
          nowPoint: { x: p.x, y: p.y },
          nodeSize: { width: Manager.nodeWidth, height: Manager.nodeHeight },
          distance,
          radian
        };
        Manager.callEvent(node, "move", params);
      }
      e.preventDefault();
     // e.stopPropagation();
    } else {
      let node = Manager.moveNode; //移動中ノード
      let p = Manager.getPos(e); //座標の取得
      let params: MovePoint = {
        event: e,
        nodePoint: { x: Manager.nodeX, y: Manager.nodeY },
        basePoint: { x: Manager.baseX, y: Manager.baseY },
        nowPoint: { x: p.x, y: p.y },
        nodeSize: { width: Manager.nodeWidth, height: Manager.nodeHeight }
      };
      Manager.callEvent(node, "move", params);
      e.preventDefault();
      //e.stopPropagation();
    }
  }
  // e.preventDefault();
}
function getDistance(p: TouchList) {
  const x = p[0].pageX - p[1].pageX;
  const y = p[0].pageY - p[1].pageY;
  return Math.sqrt(x * x + y * y);
}
function getRadian(p: TouchList) {
  const x = p[0].pageX - p[1].pageX;
  const y = p[0].pageY - p[1].pageY;
  return Math.atan2(y, x);
}
function onTouchStart(e: TouchEvent) {
  Manager.pinchiBaseDistance = undefined;
}

export function objectAssign(target: object, ...src: object[]): any {
  if (Object.assign) {
    return Object.assign(target, ...src);
  }
  for (let i = 0, l = src.length; i < l; i++) {
    for (const key of Object.keys(src[i])) {
      (target as { [key: string]: unknown })[key] = (src[i] as {
        [key: string]: unknown;
      })[key] as never;
    }
  }
  return target;
}
export function getSetValues<T>(inst:Set<T>):T[]{
  if(inst.values){
    return Array.from(inst.values());
  }
  const values:T[] = [];
  inst.forEach((v)=>{
    values.push(v);
  })
  return values;
}

addEventListener("mouseup", mouseUp, false);
addEventListener("touchend", mouseUp, { passive: false });
addEventListener("mousemove", mouseMove, false);
addEventListener("touchmove", mouseMove, { passive: false });
addEventListener("touchstart", onTouchStart, { passive: false });
