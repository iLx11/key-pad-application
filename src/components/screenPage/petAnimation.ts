import atlasUrl from '../../assets/pet/frost-lop.png'
import sprite from '../../assets/pet/frost-lop.json'
import type { PetAction } from './petScene'
import { drawHeadPat, patContact, patTouchPose, rabbitBrows } from './petHeadPat'

export const rabbitAtlasUrl = atlasUrl

function frameFor(action: PetAction, elapsed: number) {
  const blink = action === 'idle' && elapsed >= 1400 && elapsed < 1525
  const name = blink ? 'blink' : action === 'idle' ? 'daydream' : action === 'react' ? 'jump' : action
  const clip = sprite.clips[name]
  const total = clip.ticks.reduce((sum, duration) => sum + duration, 0)
  const elapsedTicks = Math.floor(elapsed * sprite.tickRateHz / 1000)
  const loopFrom = 'loopFrom' in clip ? Number(clip.loopFrom) : 0
  const start = clip.ticks.slice(0, loopFrom).reduce((sum, duration) => sum + duration, 0)
  let tick = clip.loop && elapsedTicks >= total
    ? start + (elapsedTicks - start) % (total - start) : Math.min(elapsedTicks, total - 1)
  for (let i = 0; i < clip.ticks.length; i++) {
    if (tick < clip.ticks[i]) return 'poses' in clip ? clip.poses[i] : clip.first + i
    tick -= clip.ticks[i]
  }
  return clip.first
}

export function drawRabbit(
  ctx: CanvasRenderingContext2D, atlas: HTMLImageElement, x: number, y: number,
  direction: number, action: PetAction, elapsed: number, patPhase?: number
) {
  if (!atlas.complete || !atlas.naturalWidth) return
  const { width, height, anchorX, anchorY } = sprite
  const pose = frameFor(action, elapsed)
  const frame = patPhase !== undefined && patContact[patPhase] ? patTouchPose[pose] : pose
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(direction, 1)
  ctx.drawImage(atlas, frame * width, 0, width, height, -anchorX, -anchorY, width, height)
  ctx.restore()
  return frame
}

export function bitePosition(x: number, y: number, direction: number, pose: number) {
  const mouth = sprite.biteMouth[pose - sprite.clips.eat.first]
  if (!mouth) return
  return { x: x + direction * (mouth[0] - sprite.anchorX + 6), y: y + mouth[1] - sprite.anchorY - 1 }
}

export function drawRabbitHeadPat(ctx: CanvasRenderingContext2D, x: number, y: number, direction: number,
  frame: number, kind: number, phase: number) {
  const [browX, browY] = rabbitBrows[frame]
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(direction, 1)
  drawHeadPat(ctx, browX - sprite.anchorX, browY - sprite.anchorY, kind, phase)
  ctx.restore()
}
