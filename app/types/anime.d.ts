/**
 * Minimal TypeScript declarations for animejs v3.
 * The package ships no built-in types; this file provides just enough for our usage.
 */
declare module 'animejs/lib/anime.es.js' {
  type EasingFunction = string

  interface StaggerOptions {
    start?:     number
    from?:      number | 'first' | 'last' | 'center'
    direction?: 'normal' | 'reverse'
    easing?:    EasingFunction
    grid?:      [number, number]
  }

  type PropertyValue  = number | string | Record<string, unknown> | PropertyValueWithEasing[]
  interface PropertyValueWithEasing {
    value:     number | string
    duration?: number
    delay?:    number
    easing?:   EasingFunction
  }

  interface AnimeParams {
    targets:   unknown
    easing?:   EasingFunction
    duration?: number
    delay?:    number | ((el: unknown, i: number, total: number) => number)
    loop?:     boolean | number
    direction?: string
    autoplay?:  boolean
    complete?:  () => void
    [key: string]: unknown
  }

  interface AnimeTimelineInstance {
    add(params: AnimeParams, timeOffset?: number | string): AnimeTimelineInstance
  }

  interface AnimeStatic {
    (params: AnimeParams): unknown
    stagger(value: number | string, options?: StaggerOptions): (el: unknown, i: number, total: number) => number
    set(targets: unknown, values: Record<string, unknown>): void
    timeline(params?: Partial<AnimeParams>): AnimeTimelineInstance
    random(min: number, max: number): number
  }

  const anime: AnimeStatic
  export default anime
}
