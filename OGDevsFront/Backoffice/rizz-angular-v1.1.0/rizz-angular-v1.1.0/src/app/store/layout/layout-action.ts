import { createAction, props } from '@ngrx/store'

export const changetheme = createAction(
  '[Layout] Set Color',
  props<{ color: string }>()
)

export const changesidebarsize = createAction(
  '[Layout] Set size',
  props<{ size: string }>()
)

export const changestartbarcolor = createAction(
  '[Layout] Set startbarColor',
  props<{ startcolor: string }>()
)
