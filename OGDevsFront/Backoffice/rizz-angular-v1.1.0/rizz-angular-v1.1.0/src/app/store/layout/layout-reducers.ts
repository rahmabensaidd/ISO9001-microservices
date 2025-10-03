import { createReducer, on } from '@ngrx/store'
import {
  LAYOUT_COLOR_TYPES,
  SIDEBAR_SIZE_TYPES,
  STARTBAR_COLOR_TYPE,
} from './layout'
import {
  changesidebarsize,
  changestartbarcolor,
  changetheme,
} from './layout-action'
export interface LayoutState {
  LAYOUT_THEME: string
  MENU_SIZE: string
  STARTBAR_COLOR: string
}

// IntialState
export const initialState: LayoutState = {
  LAYOUT_THEME: LAYOUT_COLOR_TYPES.LIGHTMODE,
  MENU_SIZE: SIDEBAR_SIZE_TYPES.COLLAPSED,
  STARTBAR_COLOR: STARTBAR_COLOR_TYPE.LIGHT,
}

// Reducer
export const layoutReducer = createReducer(
  initialState,
  on(changetheme, (state, action) => ({
    ...state,
    LAYOUT_THEME: action.color,
  })),
  on(changesidebarsize, (state, action) => ({
    ...state,
    MENU_SIZE: action.size,
  })),
  on(changestartbarcolor, (state, action) => ({
    ...state,
    STARTBAR_COLOR: action.startcolor,
  }))
)
