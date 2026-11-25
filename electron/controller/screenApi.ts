export async function fetchScreenValue(url: unknown, field: unknown) {
  if (typeof url !== 'string' || url.length > 2048 || typeof field !== 'string' || field.length > 256) {
    return { ok: false, error: 'API 地址或字段格式有误' }
  }
  let endpoint: URL
  try {
    endpoint = new URL(url)
    if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
      throw new Error()
    }
  } catch {
    return { ok: false, error: '请输入有效的 HTTP 或 HTTPS 地址' }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      redirect: 'error',
      headers: { Accept: 'application/json, text/plain' }
    })
    if (!response.ok) return { ok: false, error: `API 返回 HTTP ${response.status}` }
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let body = ''
    let size = 0
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 64 * 1024) {
          controller.abort()
          return { ok: false, error: 'API 响应超过 64 KB' }
        }
        body += decoder.decode(value, { stream: true })
      }
      body += decoder.decode()
    }
    let value: unknown = body.trim()
    try {
      value = JSON.parse(body)
    } catch {
      if (field) return { ok: false, error: '请填写返回 JSON 的 API 地址，或清空字段路径' }
    }
    for (const key of field.split('.').filter(Boolean)) {
      if (value === null || typeof value !== 'object' || !Object.hasOwn(value, key)) {
        return { ok: false, error: 'API 返回中找不到该字段' }
      }
      value = value[key as keyof typeof value]
    }
    if (!['string', 'number', 'boolean'].includes(typeof value) || String(value).trim() === '') {
      return { ok: false, error: '请选择返回文字、数字或布尔值的字段' }
    }
    return { ok: true, value: String(value).replace(/\s+/g, ' ').trim().slice(0, 100) }
  } catch {
    return { ok: false, error: controller.signal.aborted ? 'API 请求超时' : 'API 请求失败，请检查地址和网络' }
  } finally {
    clearTimeout(timeout)
    controller.abort()
  }
}
