import { createFeatureSelector, createSelector } from '@ngrx/store'
import { LayoutState } from './layout-reducers'

export const getLayoutState = createFeatureSelector<LayoutState>('layout')

export const getLayoutColor = createSelector(
  getLayoutState,
  (state: LayoutState) => state.LAYOUT_THEME
)

export const getSidebarsize = createSelector(
  getLayoutState,
  (state: LayoutState) => state.MENU_SIZE
)

export const getStartbarcolor = createSelector(
  getLayoutState,
  (state: LayoutState) => state.STARTBAR_COLOR
)
