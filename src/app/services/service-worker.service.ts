import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateActivatedEvent, UpdateAvailableEvent } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { interval, concat, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {

  get isEnabled(): boolean {
    return this.update.isEnabled;
  }
  get activated(): Observable<UpdateActivatedEvent> {
    return this.update.activated;
  }
  get available(): Observable<UpdateAvailableEvent> {
    return this.update.available;
  }

  constructor(appRef: ApplicationRef, private update: SwUpdate) {
    if (!this.isEnabled) {
      console.log('Service worker is disabled.');
      return;
    }

    console.log('Service worker is enabled.');
    // schedule an update check every 6 hours after the application became stable
    concat(appRef.isStable.pipe(first(isStable => isStable === true)), interval(1000 * 3600 * 6))
    .subscribe(() => {
      console.log('Checking for application update...');
      this.checkForUpdate();
    });

    // log if a new app version becomes available
    /* istanbul ignore next */
    this.available.subscribe(() => {
      console.log('Application update available');
    });

    // log if a new app version was activated
    /* istanbul ignore next */
    update.activated.subscribe(() => {
      console.log('Application updated');
    });
  }

  public checkForUpdate(): Promise<void> {
    return this.update.checkForUpdate();
  }

  /* istanbul ignore next */
  public async activateUpdate(): Promise<void> {
    await this.update.activateUpdate();
    document.location.reload();
  }
}
