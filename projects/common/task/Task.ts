import { getChild } from '../floaty-children';
import {
  getTaskCount,
  getTaskDelay,
  getTaskIntro,
  TaskCountResult,
} from '../get-task-count';
import { $ } from '../ui-object';

type GetTaskBtn = (container: UiObject) => UiObject | null | undefined;
type GetTaskTitle = (container: UiObject) => string;
type GetTaskCount = (container: UiObject) => TaskCountResult | undefined;
type GetTaskIntro = (container: UiObject) => string | undefined;
type GetTaskDelay = (container: UiObject) => number;

interface TaskConfig {
  container: UiObject;
  btn?: UiObject | null | GetTaskBtn;
  taskCount?: TaskCountResult | GetTaskCount;
  title?: string | null | GetTaskTitle;
  intro?: string | GetTaskIntro;
  delay?: number | GetTaskDelay;
}

class Task {
  private static defaultFns = {
    btn: (container: UiObject) => {
      return $(container, /去完成/) ?? getChild(container, 3);
    },
    title: (container: UiObject) => {
      return $(container, /.*\(\d+\/\d+.*/)?.text() ?? '';
    },
    taskCount: (container: UiObject) => {
      return getTaskCount(container);
    },
    intro: (container: UiObject) => {
      return getTaskIntro(container);
    },
    delay: (container: UiObject) => {
      return getTaskDelay(container);
    },
  };

  public constructor(public config: TaskConfig) {}

  public get title() {
    return this.buildAttr('title');
  }

  public get btn() {
    return this.buildAttr('btn');
  }

  public get taskCount() {
    return this.buildAttr('taskCount');
  }

  public get intro() {
    return this.buildAttr('intro');
  }

  public get delay(): number {
    return this.buildAttr('delay');
  }

  private buildAttr(key: 'title'): string;
  private buildAttr(key: 'btn'): UiObject | null;
  private buildAttr(key: 'taskCount'): TaskCountResult | null;
  private buildAttr(key: 'intro'): string | undefined;
  private buildAttr(key: 'delay'): number;
  private buildAttr(key: Exclude<keyof TaskConfig, 'container'>) {
    const attrConfig = this.config[key];

    if (attrConfig) {
      if (typeof attrConfig === 'function') {
        return attrConfig(this.config.container);
      }

      return attrConfig;
    }

    return Task.defaultFns[key](this.config.container);
  }
}

export { Task };
