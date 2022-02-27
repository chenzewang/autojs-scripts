import { checkFloaty, openFloatySetting } from '@/common/floaty-permission';
import { getCaptureImage } from '@/common/image';
import { muteRestoreMusic } from '@/common/mute';
import { tl } from '@/common/toast';
import { runJDJR, runJDMall } from '@/jd/211111/tasks';
import { downloadFile, getScriptPath } from '@/third-party/download';
import './head';
import layout from './layout.xml';

layout();

/**
 * View的状态
 */
enum Status {
  visible = 0,
  invisible = 8,
}

/**
 * 权限的状态
 */
const PermissionStatus: {
  // 无状态服务是否打开
  accessibility: boolean;
  // 悬浮窗权限是否打开
  floaty: boolean;
  [key: string]: boolean;
} = {
  floaty: false,
  accessibility: false,
};

// 第三方脚本的链接
const thirdPartyScripts = [
  {
    key: 'czj2369_tb',
    url: 'https://mirror.ghproxy.com/https://raw.githubusercontent.com/czj2369/jd_tb_auto/master/auto_20211111/tb/main.js',
  },
];

const btns = [
  {
    id: 'runJDBtn',
    type: 'jd',
  },
  {
    id: 'runJDMall',
    type: 'mall',
  },
  {
    id: 'runJDJR',
    type: 'jr',
  },
];

/**
 *
 * 渲染 与获取无障碍权限相关的按钮
 */
function renderAccessibility(type: boolean) {
  if (type) {
    ui.accessibilityStatusCheck.visibility = Status.invisible;
    ui.accessibilityStatusSuccess.visibility = Status.visible;
    ui.waring.visibility = Status.invisible;
  } else {
    ui.accessibilityStatusCheck.visibility = Status.visible;
    ui.accessibilityStatusSuccess.visibility = Status.invisible;
    ui.waring.visibility = Status.visible;
  }
}

/**
 * 渲染 与获取悬浮窗权限相关的按钮
 */
function renderFloaty(type: boolean | 'hidden') {
  if (type === 'hidden') {
    ui.floatyBtn.visibility = Status.invisible;
    ui.floatyStatusCheck.visibility = Status.invisible;
    ui.floatyStatusSuccess.visibility = Status.invisible;
  } else if (type === true) {
    ui.floatyBtn.visibility = Status.visible;
    ui.floatyStatusCheck.visibility = Status.invisible;
    ui.floatyStatusSuccess.visibility = Status.visible;
  } else if (type === false) {
    ui.floatyBtn.visibility = Status.visible;

    ui.floatyStatusCheck.visibility = Status.visible;
    ui.floatyStatusSuccess.visibility = Status.invisible;
  }
}

/**
 * 渲染第三方脚本的按钮
 */
function renderThirdParty() {
  const statusList: { key: string; success?: boolean; failed?: boolean }[] = [];

  // 每秒检查所有外部脚本，直到所有脚本都已经下载到本地
  const interval = setInterval(() => {
    if (!thirdPartyScripts.length) {
      clearInterval(interval);
      return;
    }

    thirdPartyScripts.forEach(({ key }) => {
      const status = statusList.find(({ key: sk }) => {
        return sk === key;
      }) ?? { success: false, failed: false };

      if (status.success) {
        ui[key].visibility = Status.visible;
      } else if (status.failed) {
        ui[`${key}_failed`].visibility = Status.visible;
      } else {
        ui[key].visibility = Status.invisible;
        ui[`${key}_failed`].visibility = Status.invisible;
      }
    });

    if (statusList.length === thirdPartyScripts.length) {
      clearInterval(interval);
      tl('结束第三方脚本检测');
      return;
    }
  }, 1000);

  thirdPartyScripts.forEach(({ key, url }) => {
    ui[key].click(() => {
      engines.execScriptFile(getScriptPath(key));
    });

    downloadFile({
      url,
      key,
      callback: (error, _, filePath) => {
        if (error) {
          statusList.push({ key, failed: true });
          return;
        }

        if (!filePath) {
          statusList.push({ key, failed: true });
          return;
        }

        statusList.push({ key, success: true });
      },
    });
  });
}

function render() {
  if (!PermissionStatus.accessibility) {
    renderAccessibility(false);
    renderFloaty('hidden');
  } else {
    renderAccessibility(true);
    renderFloaty(PermissionStatus.floaty);

    renderThirdParty();
  }

  if (PermissionStatus.accessibility && PermissionStatus.floaty) {
    btns.forEach(({ id }) => {
      ui[id].visibility = Status.visible;
    });
  } else {
    btns.forEach(({ id }) => {
      ui[id].visibility = Status.invisible;
    });
  }
}

async function checkStatus() {
  PermissionStatus.accessibility = !!auto.service;
  PermissionStatus.floaty = checkFloaty();

  render();
}

let threadCache: threads.Thread | null = null;

function run(type: string) {
  // 停止上次可能在运行的脚本
  if (threadCache) {
    tl('停止上次残留中....');
    threadCache.interrupt();
    threadCache = null;
  }

  try {
    threadCache = threads.start(() => {
      const restoreMusic = muteRestoreMusic();
      getCaptureImage();

      if (type === 'jd') {
        runJDMall(3);
        runJDJR(3);
      } else if (type === 'mall') {
        runJDMall(3);
      } else if (type === 'jr') {
        runJDJR(3);
      }

      restoreMusic();
    });
  } catch (e) {
    tl(e);
  }
}

events.on('exit', () => {
  tl('结束运行');
  threads.shutDownAll();
});

// 去获取无障碍权限
ui.accessibilityBtn.click(async () => {
  await checkStatus();

  if (!PermissionStatus.accessibility) {
    app.startActivity({
      action: 'android.settings.ACCESSIBILITY_SETTINGS',
    });
  }
});

// 去获取悬浮窗权限
ui.floatyBtn.click(async () => {
  await checkStatus();

  if (!PermissionStatus.floaty) {
    openFloatySetting();
  }
});

// 回到ui时
ui.emitter.on('resume', () => {
  checkStatus();
});

// 离开ui时
ui.emitter.on('exit', () => {
  threads.shutDownAll();
});

// 给任务按钮绑定事件
btns.forEach(({ id, type }) => {
  ui[id].click(() => {
    run(type);
  });
});

ui.consoleBtn.click(() => {
  app.startActivity('console');
});

setTimeout(() => {
  checkStatus();
}, 100);
