export type DeviceButtons =
  | { state: 'ready'; held: number; pressed: number }
  | { state: 'busy' | 'disconnected' | 'unsupported' | 'unavailable' }
