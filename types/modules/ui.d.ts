
interface View {
    w: 'auto' | '*' | number;
    h: 'auto' | '*' | number;
    id: string;
    gravity: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'center_vertical' | 'center_horizontal' | string;
    layout_gravity: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'center_vertical' | 'center_horizontal' | string;
    margin: number | string;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    padding: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    bg: any;
    alpha
    foreground
    minHeight
    minWidth
    visbility
    rotation
    transformPivotX
    transformPivotY
    style
    click: (callback: (...args: any[]) => void) => any
    visibility: Status
}
/**
 * View的状态
 */
declare enum Status {
    visible = 0,
    invisible = 8,
}


// interface UI {
//     [id: string]: View | ((...args: any[]) => any);
//     layout(xml: any): void;
//     inflate(xml: any, parent?: View): void;
//     findView(id: string): View;
//     finish()
//     setContentView(view: View)
//     run(callback)
//     post(callback, delay?: number): void;
//     statusBarColor(color)
//     showPopupMenu(view, menu)
// }

// declare const ui: UI;

// type View = any;

interface UILike {
    toString(): string;
}

interface Ui extends Views {
    layout(xml: UILike | any): void;
    inflate(xml: UILike | any, parent?: View): void;
    findView(id: string): View;
    finish(): void;
    setContentView(view: View): void;
    run(callback: Function): void;
    post(callback: Function, delay?: number): void;
    statusBarColor(color: any): void;
    showPopupMenu(view: View, menu: any): void;

    emitter: EventEmitter;

    // [id: string]: View | ((...args: any[]) => any)|

    [key: string]: UiObject | Function | any;
}

interface Views {
    accessibilityStatusCheck: View
    accessibilityStatusSuccess: View
    waring: View
    accessibilityBtn: View
    floatyStatusCheck: View
    floatyStatusSuccess: View
    floatyBtn: View
    consoleBtn: View
    runJDMall: View
    runJDJR: View
    czj2369_tb_failed: View
    czj2369_tb: View

    [id: string]: View
}


declare var ui: Ui;