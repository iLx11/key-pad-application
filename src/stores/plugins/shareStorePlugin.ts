import { ipcRenderer } from "electron";
import { PiniaPluginContext } from "pinia";

declare module "pinia" {
  export interface PiniaCustomProperties {
    storeUpdateVersion: number; // 标记store变更的版本
  }
}

// 处理electron多窗口，pinia共享问题
export function shareStorePlugin({ store }: PiniaPluginContext) {
  // 初始化本地缓存版本
  const storeName: string = store.$id;
  // 监听数据变化
  store.$subscribe(() => {
    console.log(`主动更新 ${storeName} 的状态`);
     // 通知主线程更新
    ipcRenderer.invoke(
      "pinia-store-change",
      storeName,
      JSON.stringify(store.$state)
    );
  });

 // 监听数据同步修改
  ipcRenderer.on(
    "pinia-store-set",
    (event, targetStoreName: string, jsonStr: string) => {
      // 监听到状态改变后，同步更新状态
      if (storeName === targetStoreName) {
        console.log("被动更新状态:" + storeName);

        const obj = JSON.parse(jsonStr);
        const keys = Object.keys(obj);
        const values = Object.values(obj);

        /// 更新各个key对应的值的状态
        for (let i = 0; i < keys.length; i++) {
          store.$state[keys[i]] = values[i];
        }
      }
    }
  );
}