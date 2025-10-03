import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutSuccess,
} from './authentication.actions';
import { AuthenticationService } from '@/app/core/service/auth.service';

@Injectable()
export class AuthenticationEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) => {
        return this.authService.login(email, password).pipe(
          map((user) => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
            return loginSuccess({ user });
          }),
          catchError((error) => of(loginFailure({ error: error.message })))
        );
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() => {
        this.authService.logout();
        this.router.navigate(['/auth/log-in']);
        return of(logoutSuccess());
      })
    )
  );

  constructor(
    @Inject(Actions) private actions$: Actions,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
}
