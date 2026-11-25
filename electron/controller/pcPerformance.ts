import { statfs } from 'node:fs/promises'
import { cpus, freemem, totalmem } from 'node:os'
import { parse } from 'node:path'

function cpuTimes() {
  return cpus().reduce(({ idle, total }, { times }) => ({
    idle: idle + times.idle,
    total: total + times.user + times.nice + times.sys + times.idle + times.irq
  }), { idle: 0, total: 0 })
}

let previous = cpuTimes()
const percent = (value: number) => Math.max(0, Math.min(100, Math.round(value * 100)))

export async function readPcPerformance() {
  const current = cpuTimes()
  const elapsed = current.total - previous.total
  const cpu = elapsed > 0 ? percent(1 - (current.idle - previous.idle) / elapsed) : 255
  previous = current
  const memory = totalmem() > 0 ? percent(1 - freemem() / totalmem()) : 255
  const root = process.platform === 'win32' && process.env.SystemDrive
    ? process.env.SystemDrive + '\\' : parse(process.execPath).root
  const disk = await statfs(root).then(stats => stats.blocks > 0 ? percent(1 - stats.bfree / stats.blocks) : 255)
    .catch(() => 255)
  return [cpu, memory, disk]
}
