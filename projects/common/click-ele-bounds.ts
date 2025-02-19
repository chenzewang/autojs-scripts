import { floatyDebug } from './floaty-debug';
import { Radius } from './interface';
import { isRadius, isRect, isRegExp, isUiObject } from './type-check';
import { simpleUiObject } from './ui-object';

type Position = (bounds: Rect | Radius) => { x: number; y: number };

function boundsClick(rect?: Rect, delay?: number, position?: Position): boolean;
function boundsClick(
  ele?: UiObject | null,
  delay?: number,
  position?: Position,
): boolean;
function boundsClick(
  str?: string,
  delay?: number,
  position?: Position,
): boolean;
function boundsClick(
  reg?: RegExp,
  delay?: number,
  position?: Position,
): boolean;
function boundsClick(
  radius?: Radius,
  delay?: number,
  position?: Position,
): boolean;
function boundsClick(
  param?: Rect | Radius | UiObject | string | RegExp | null,
  delay = 2000,
  position = (bounds: Rect | Radius) => {
    let tmp: { x: number; y: number };

    if (isRect(bounds)) {
      tmp = { x: bounds.centerX(), y: bounds.centerY() };
    } else {
      tmp = bounds;
    }

    if (
      tmp.x === null ||
      tmp.x === null ||
      tmp.x === undefined ||
      tmp.x === undefined
    ) {
      throw new Error('no position found');
    }

    return tmp;
  },
): boolean {
  let bounds: Rect | Radius | undefined;

  if (typeof param === 'undefined' || param === null) {
    return false;
  }

  if (typeof param === 'string') {
    bounds = textContains(param).findOnce()?.bounds();
  } else if (isRegExp(param)) {
    bounds = textMatches(param).findOnce()?.bounds();
  } else if (isRect(param)) {
    bounds = param;
  } else if (isRadius(param)) {
    bounds = param;
  } else if (isUiObject(param)) {
    console.log(simpleUiObject(param));
    bounds = param?.bounds();
  }

  if (!bounds) {
    return false;
  }

  floatyDebug(bounds);

  const { x, y } = position(bounds);

  click(x, y);
  sleep(delay);
  return true;
}

export { boundsClick };
