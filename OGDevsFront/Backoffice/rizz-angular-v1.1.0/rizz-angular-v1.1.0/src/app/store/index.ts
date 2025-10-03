import { ActionReducerMap } from '@ngrx/store'
import { LayoutState, layoutReducer } from './layout/layout-reducers'
import {
  AuthenticationState,
  authenticationReducer,
} from './authentication/authentication.reducer'
import {
  calendarReducer,
  type CalendarState,
} from './calendar/calendar.reducer'
import { KanbanReducer, type KanbanState } from './kanban/kanban.reducer'

export interface RootReducerState {
  layout: LayoutState
  authentication: AuthenticationState
  Calendar: CalendarState
  Task: KanbanState
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  layout: layoutReducer,
  authentication: authenticationReducer,
  Calendar: calendarReducer,
  Task: KanbanReducer,
}
