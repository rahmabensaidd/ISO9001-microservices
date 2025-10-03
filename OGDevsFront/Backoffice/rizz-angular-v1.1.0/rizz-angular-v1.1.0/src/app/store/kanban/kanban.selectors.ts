import { createFeatureSelector, createSelector } from '@ngrx/store'
import type { KanbanState } from './kanban.reducer'

export const selectDataState = createFeatureSelector<KanbanState>('Task')

export const getKanbanData = createSelector(
  selectDataState,
  (state: KanbanState) => state.task
)

export const getKanbanBoard = createSelector(
  selectDataState,
  (state: KanbanState) => state.board
)
