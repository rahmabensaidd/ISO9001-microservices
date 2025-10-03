import { createAction, props } from '@ngrx/store'
import type { KanbanSectionType, KanbanTaskType } from './data'

// Kanban Board
export const fetchKanbanBoard = createAction(
  '[Order] Fetch KanbanBoard Product'
)
export const fetchKanbanBoardSuccess = createAction(
  '[Order] Fetch KanbanBoard Success',
  props<{ board: KanbanSectionType[] }>()
)
export const fetchKanbanBoardFailure = createAction(
  '[Data] Fetch KanbaBoard Failure',
  props<{ error: string }>()
)

// Add Task Data
export const addBoard = createAction(
  '[Data] Add Kanban',
  props<{ newData: KanbanSectionType }>()
)
export const addBoardSuccess = createAction(
  '[Data] Add Kanban Board Success',
  props<{ newData: KanbanSectionType }>()
)
export const addBoardFailure = createAction(
  '[Data] Add Kanban Board Failure',
  props<{ error: string }>()
)

// Delete Kanban Data
export const deleteBoard = createAction(
  '[Data] Delete Board',
  props<{ id: string }>()
)
export const deleteBoardSuccess = createAction(
  '[Data] Delete Board Success',
  props<{ id: string }>()
)
export const deleteBoardFailure = createAction(
  '[Data] Delete Board Failure',
  props<{ error: string }>()
)

// Kanban Task
export const fetchKanbanTask = createAction('[Order] Fetch KanbanTask Product')
export const fetchKanbanTaskSuccess = createAction(
  '[Order] Fetch KanbanTask Success',
  props<{ task: KanbanTaskType[] }>()
)
export const fetchKanbanTaskFailure = createAction(
  '[Data] Fetch KanbanTask Failure',
  props<{ error: string }>()
)

// Add Task Data
export const addKanban = createAction(
  '[Data] Add Kanban',
  props<{ newData: KanbanTaskType }>()
)
export const addKanbanSuccess = createAction(
  '[Data] Add Kanban Success',
  props<{ newData: KanbanTaskType }>()
)
export const addKanbanFailure = createAction(
  '[Data] Add Kanban Failure',
  props<{ error: string }>()
)

// Update Kanban Data
export const updateKanban = createAction(
  '[Data] Update Kanban',
  props<{ updatedData: KanbanTaskType }>()
)
export const updateKanbanSuccess = createAction(
  '[Data] Update Kanban Success',
  props<{ updatedData: KanbanTaskType }>()
)
export const updateKanbanFailure = createAction(
  '[Data] Update Kanban Failure',
  props<{ error: string }>()
)
