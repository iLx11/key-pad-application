import { hutchBounds, petFruitLabels, petScenes } from '../../src/utils/petCatalog'

export const petServerInstructions = '你控制的是实体键盘上的宠物兔。先读 pet_get_care_guide 了解动作和属性，再读 pet_get_state。' +
  '自主活动时按 automaticBehaviors 选择行为，用 pet_perform_sequence 编排顺序与等待。availableNow 记录设备当前支持的操作。按钮和兔子的自主行为也会改变状态。工作模式是否切换由主人决定。' +
  '在取食、靠近玩具或回窝时可以等待。为确认一次操作，事先读取 pet_get_events 至 hasMore=false 并保存 cursor，' +
  '再执行一次操作，用该游标读取后续事件。没有收到写入回执时先确认状态或事件，避免重复投喂或收回刚放好的玩具。'

// Nominal times and stat changes are defined by pet_mode.c and pet_care.c.
// Travel time, natural metabolism and interrupted activities are separate.
export const petCareGuide = {
  stats: {
    range: [0, 100],
    satiety: '越高越饱。养宠模式累计每分钟 −1。第 6 代起达到 90 时暂停吃水果，旧版达到 100 时暂停，剩下的留在原场景。',
    energy: '越高越有精神。清醒每满 60 秒 −1，睡着每满 20 秒 +1。散步或取食移动累计 60 秒，饱食度和精神值各额外 −1；跑、跳、逃跑、兔子舞按双倍运动时间累计。精神值 ≤15 时避免主动剧烈运动。',
    mood: '越高越开心。每个代谢周期开始时，若饱食度低于 25 或精神值低于 15，心情 −1。',
    affection: '越高越亲近主人。吃完水果、玩完玩具和回应主人的注视可增加好感。第 9 代起，饱食度≤25、心情≤30 或精神值≤20，持续每 5 分钟好感 −1；饱食度和心情均≥70 且精神值≥70，持续每 10 分钟好感 +1。中间状态持平，只累计养宠时间。'
  },
  actions: {
    idle: '待机，长睡时可叫醒。约 1.7 秒后可能自行散步。',
    blink: '眨眼，约 0.125 秒。', walk: '散步，到边界或约 3.6 秒后会自行停下。',
    run: '奔跑，约 2.3 秒。', jump: '跳一下，约 0.5 秒。', daydream: '做白日梦，约 1.75 秒。',
    flee: '受惊逃跑，约 2.3 秒。', eat: '仅播放约 2.1 秒的进食动作，没有水果和饱食度收益。',
    stand_watch: '用后腿撑起身体，直立观察约 3 秒，再落回四足。',
    groom_fur: '原地回头舔理身侧的毛约 2.5 秒。',
    groom_ear: '坐着捧起垂耳，低头舔耳内侧，再用前爪沿着耳尖捋顺，全程约 3 秒。两种梳理都不改变属性。',
    binky: '兔子舞：向前跃起，半空蹬伸后腿转身，背向起跳方向落地。心情越高越容易自发跳舞。',
    inspect_table: '在宝宝房走到玩具桌右侧，前爪搭桌沿观察约 3.4 秒，结束后回到地面。两种眺望都不额外改变属性。',
    trip_angry: '绊脚生气，约 2.05 秒。自然结束时精神值 −1、心情 −4。',
    gaze_owner: '面向主人发呆，约 3 秒。由 MCP 发起且自然结束时心情 +1、好感 +1。',
    sleep: '持续睡眠，无固定时长。第 3 代起会从花园走到宝宝房兔窝。到达前可以同时是 action=walk、bedtime=true。'
  },
  food: {
    tool: 'pet_feed', fruits: petFruitLabels,
    timing: '投下一份水果，掉落约 0.65 秒。兔子走到食物旁后吃约 0.85 秒。第 3 代起每场景可同时放八份，按投放顺序每次吃一份。',
    result: '从第 2 代起，每份吃完增加饱食度 12、心情 3、好感 2，各项最高 100。八种水果效果相同。',
    confirmation: '收到 fruit_eaten 才是吃完。fruit_queued 是已接收，fruit_landed 是已落地。相同来源连续投放同种水果时，事件没有单份标识。'
  },
  interactions: {
    headPet: '第 5 代起，主人轻按大旋钮或按住后转过一格可以摸兔子的头，桌面的大旋钮也能模拟。' +
      '每次轻按和每个有效转格产生 head_petted，gesture 依次用 tap、cw（顺时针）、ccw（逆时针）表示。' +
      '一次抚摸的心情和好感各 +1，最高 100。1.2 秒内继续摸会延长动画。一次按住只奖励一次，停顿后继续转仍属同一次。' +
      '第六代会暂停当前动作，手随转格移动，停转即停，松手后继续活动。headPet.remainingMs 表示剩余动画时长。',
    carrot_toy: '第 3 代起两个场景各有一个玩具位。pet_place_toy 幂等放置，落地后兔子有空就去玩，玩完留在原处。' +
      'pet_interact_with_toy 可再玩一次，pet_use_toy 会切换放下或收回。走到玩具旁后玩约 2.4 秒，' +
      '自然结束时饱食度 −1、精神值 −2、心情 +6、好感 +2。玩具期间的 eat 动作没有吃下水果。',
    rabbit_hutch: '第 4 代起是宝宝房的常驻装饰，可与胡萝卜共存。pet_interact_with_decoration 从任一场景前往兔窝，' +
      '到达后小憩约 4.5 秒，自然结束时精神值 +12、心情 +5、好感 +2。长睡使用 pet_play_action(sleep)，' +
      '按睡眠时间恢复精神值。pet_move_decoration 在养宠模式中设置窝的底边中心，键盘保存位置。',
    hutchBounds
  },
  scenes: {
    ids: petScenes, garden: '花园', nursery: '宝宝房',
    scope: 'foods 与 toyDropProgress 描述当前场景。deployedToys 记录两个场景的玩具。第六代还通过 otherRoom 提供另一场景的食物和玩具落地进度，awaitingPlay 表示是否等待自动互动。' +
      '第 3 代起切换场景会打断当前互动，留下该场景的水果和玩具。切换到宝宝房时花园地上的水果仍可能存在。'
  },
  compatibility: {
    1: '基础动作、按队列投喂、时间和季节。没有属性、玩具和场景读数。fall、fetch 是设备内部动作。',
    2: '增加四项属性、trip_angry、gaze_owner 和场景；宝宝房兔窝通过 pet_use_toy 短暂互动。',
    3: '增加多份地面食物、玩具放置和重玩、回窝长睡、跟随时间与按键绑定。此代兔窝仍占用宝宝房玩具位。',
    4: '兔窝成为独立可移动装饰。使用 activeDecoration、decorationPhase 和 hutchPosition 读取回窝状态。',
    9: '好感随持续照料状况变化，可以编排 groom_fur 和 groom_ear。',
    8: '可执行 binky 兔子舞，动作年龄可用 actionAgeMs 观察。普通眺望直立约 3 秒。',
    7: '可站起来眺望，在宝宝房探访 nursery_table。家具互动阶段为 approaching 或 using。',
    6: '摸头期间兔子停在原地，转动决定手的位置和速度；饱食度达到90时留食，精神值不高于75才主动睡，恢复到95时结束长睡。',
    5: '可通过 headPet 和 head_petted 观察主人摸头。事件 source 为 physical 时来自键盘旋钮，mcp 表示软件操作。'
  },
  observation: {
    inputs: { sequence: 'pet_perform_sequence(steps)，每步包含 behavior 和 waitMs。automaticBehaviors 列出当前符合需求的行为。', actions: 'pet_play_action(action)', feed: 'pet_feed(fruit)', useToys: 'pet_use_toy(toy)',
      placeToys: 'pet_place_toy(toy)', interactToys: 'pet_interact_with_toy(toy)',
      visitDecorations: 'pet_interact_with_decoration(decoration)', moveDecorations: 'pet_move_decoration(decoration,x,y)',
      scenes: 'pet_set_scene(scene)', setHour: 'pet_set_time(hour)', setSeason: 'pet_set_season(season)', setMode: 'pet_set_mode(enabled)' },
    state: 'availableNow 是读取瞬间设备能接受的输入。feed=true 仅代表还有空位。已吃饱或地上有剩余水果时可以等待。',
    events: '使用返回的 cursor 分页，每页最多 16 条，设备保留最近 64 条。reset 表示连接改变，overrun 表示历史不完整。' +
      '只有相同 session 且游标连续时才可关联操作。toy_finished 和 decoration_finished 的 interrupted=false 表示自然结束。'
  }
}
