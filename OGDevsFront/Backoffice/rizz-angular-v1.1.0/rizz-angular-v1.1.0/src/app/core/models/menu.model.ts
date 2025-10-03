// export type MenuItem = {
//   key?: string
//   label?: string
//   icon?: string
//   link?: string
//   collapsed?: boolean
//   subMenu?: any
//   isTitle?: boolean
//   badge?: any
//   parentKey?: string
//   disabled?: boolean
// }

export interface MenuItem {
  key: string
  label: string
  isTitle?: boolean
  icon?: string
  collapsed?: boolean
  url?: string
  target?: string
  parentKey?: string
  badge?: {
    text: string
    variant: string
  }
  subMenu?: any
}
