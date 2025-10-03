declare module 'tobii' {
  interface TobiiInstance {
    on(event: string, handler: () => void): void
  }

  const Tobii: {
    new (): TobiiInstance
  }

  export default Tobii
}

declare module 'justgage'
declare module 'huebee'

declare module 'vanillajs-datepicker' {
  interface Options {
    format?: string
  }

  export default class Datepicker {
    constructor(element: Element, options?: Options)
    destroy(): void
  }
}

declare class Huebee {
  constructor(element: HTMLElement, options?: any)
  destroy(): void
}

declare module 'raphael'
