import { delayCheck } from '../delay-check';
import { AUTO_JS } from './constants';
import { skipAd as defaultSkipAd } from './skip-ad';

function openAppWithCheck({
  packageName,
  className,
  checkIsIn = () => true,

  wait = 5000,
  confirmCheck = 2,
  skipAd = defaultSkipAd,
}: {
  packageName: string;
  className: string;
  checkIsIn?: () => boolean;
  wait?: number;
  confirmCheck?: number;
  skipAd?: () => boolean;
}) {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName,
    className,
  });

  const checkIsMain = () => {
    const cp = currentPackage();
    if (cp !== packageName && cp !== AUTO_JS) {
      return false;
    }

    return checkIsIn();
  };

  let index = 0;
  return delayCheck(wait, 500, () => {
    const isAd = skipAd();

    // 是广告, 就略过
    if (isAd) {
      index = 0;
      return false;
    }

    // 主界面能找到
    if (checkIsMain()) {
      if (index < confirmCheck) {
        index += 1;
        return false;
      }

      return true;
    }

    return false;
  });
}

export { openAppWithCheck };
