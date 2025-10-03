import { createReducer, on, Action } from '@ngrx/store'
import type { KanbanSectionType, KanbanTaskType } from './data'
import {
  addBoardSuccess,
  addKanbanSuccess,
  deleteBoardSuccess,
  fetchKanbanBoard,
  fetchKanbanBoardSuccess,
  fetchKanbanTask,
  fetchKanbanTaskSuccess,
  updateKanbanSuccess,
} from './kanban.action'

export type KanbanState = {
  board: KanbanSectionType[]
  task: KanbanTaskType[]
}

export const initialState: KanbanState = {
  board: [],
  task: [],
}

export const KanbanReducer = createReducer(
  initialState,
  on(fetchKanbanBoard, (state) => {
    return { ...state }
  }),
  on(fetchKanbanBoardSuccess, (state, { board }) => {
    return { ...state, board }
  }),

  on(addBoardSuccess, (state, { newData }) => {
    return { ...state, board: [...state.board, newData], error: null }
  }),

  on(deleteBoardSuccess, (state, { id }) => {
    return {
      ...state,
      board: state.board.filter((board) => board.id !== id),
      error: null,
    }
  }),

  on(fetchKanbanTask, (state) => {
    return { ...state }
  }),
  on(fetchKanbanTaskSuccess, (state, { task }) => {
    return { ...state, task }
  }),

  on(addKanbanSuccess, (state, { newData }) => {
    return { ...state, task: [...state.task, newData], error: null }
  }),

  on(updateKanbanSuccess, (state, { updatedData }) => {
    return {
      ...state,
      Kanban: state.task.map((task) =>
        task.id === updatedData.id ? updatedData : task
      ),
      error: null,
    }
  })
)

// Selector
export function reducer(state: KanbanState | undefined, action: Action) {
  return KanbanReducer(state, action)
}
