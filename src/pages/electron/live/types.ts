export type LiveItem = {
  name: string
  url: string
}
export type MenuChild = {
  name: string
  logo: string
  active: boolean
  childList: { url: string }[]
}
export type MenuItem = {
  name: string
  img: string
  childList?: MenuChild[]
  childListArr: MenuChild[]
}
