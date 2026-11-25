import { shallowReactive } from 'vue'
import { encodeOled, renderScreenContent } from './screenContent'
import type { ScreenFrame } from './screenContent'

interface CachedFrame {
  settings: string
  refreshAt: number
  frame?: ScreenFrame
  error?: string
}

export function createLiveScreens(
  getScreens: (menu: number) => ScreenFrame[],
  paused: () => boolean,
  hasDynamicScreens: () => boolean,
  setConnected: (connected: boolean) => void,
  updateColor: (menu: number) => Promise<void>,
  allowUnconfiguredMenu: () => boolean
) {
  const win = window as any
  const cache = shallowReactive(new Map<string, CachedFrame>())
  const displayed = new Map<number, string>()
  let lastGeneration: number | undefined
  let running: Promise<void> | undefined
  let nextReconnect = 0

  const update = async () => {
    let device = await win.myApi.liveOled()
    if (device.state === 'disconnected') {
      setConnected(false)
      if (hasDynamicScreens() && Date.now() >= nextReconnect) {
        nextReconnect = Date.now() + 10_000
        if (await win.myApi.connectHardware()) device = await win.myApi.liveOled()
      }
    }
    if (device.state === 'ready' || device.state === 'unsupported') setConnected(true)
    if (device.state === 'busy') return
    if (device.state !== 'ready') {
      lastGeneration = undefined
      displayed.clear()
      return
    }
    if (device.code !== 0 || device.menu > 10 || device.menu < (allowUnconfiguredMenu() ? 0 : 1)) return
    if (lastGeneration !== device.generation) {
      lastGeneration = device.generation
      displayed.clear()
    }

    const menu = Math.max(0, device.menu - 1)
    await Promise.all([1, 2].map(async screen => {
      const config = getScreens(menu)?.[screen]?.content
      if (!config || config.mode === 'text') return
      const settings = JSON.stringify(config)
      const key = `${menu}:${screen}`
      const previous = cache.get(key)
      const now = new Date()
      if (previous?.settings === settings && previous.refreshAt > now.getTime()) return
      const interval = config.mode === 'api' ? Math.max(15, Math.min(3600, Number(config.interval) || 60)) : 60
      const refreshAt = config.mode === 'api'
        ? now.getTime() + interval * 1000
        : config.mode === 'pet' ? now.getTime() + 1000
          : now.getTime() - now.getSeconds() * 1000 - now.getMilliseconds() + 60_000
      try {
        cache.set(key, { settings, refreshAt, frame: await encodeOled(await renderScreenContent(config, now)) })
      } catch (error) {
        cache.set(key, { settings, refreshAt, frame: previous?.settings === settings ? previous.frame : undefined,
          error: error instanceof Error ? error.message : '小屏数据刷新失败' })
      }
    }))

    for (const screen of [1, 2]) {
      if (paused()) return
      const config = getScreens(menu)?.[screen]?.content
      if (!config || config.mode === 'text') {
        if (!(device.mask & (1 << (screen - 1)))) continue
        const result = await win.myApi.liveOled({ screen, generation: device.generation })
        if (result.state !== 'ready' || result.code !== 0) return
        displayed.delete(screen)
        continue
      }
      const current = cache.get(`${menu}:${screen}`)
      const frame = current?.settings === JSON.stringify(config) ? current.frame : undefined
      if (!frame || (device.mask & (1 << (screen - 1)) && displayed.get(screen) === frame.baseData)) continue
      const result = await win.myApi.liveOled({
        screen,
        generation: device.generation,
        pixels: Uint8Array.from(frame.buffData, Number)
      })
      if (result.state !== 'ready' || result.code !== 0) return
      displayed.set(screen, frame.baseData)
    }
    if (!paused()) await updateColor(menu)
  }

  return {
    tick() {
      if (paused() || running) return
      running = update().catch(() => {
        displayed.clear()
      }).finally(() => { running = undefined })
    },
    wait: () => running,
    forgetDevice() {
      lastGeneration = undefined
      displayed.clear()
    },
    current(menu: number, screen: number, saved: ScreenFrame) {
      const current = cache.get(`${menu}:${screen}`)
      return saved.content && current?.settings === JSON.stringify(saved.content) ? current : undefined
    }
  }
}
