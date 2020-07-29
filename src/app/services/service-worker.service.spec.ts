import { TestBed } from '@angular/core/testing';
import { ServiceWorkerService } from './service-worker.service';
import { SwUpdate, ServiceWorkerModule} from '@angular/service-worker';
import { ApplicationRef } from '@angular/core';

describe('ServiceWorkerService without Registration', () => {
  let service: ServiceWorkerService;
  let swUpdate: SwUpdate;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServiceWorkerModule.register('', {enabled: false})],
      providers: [SwUpdate]
    });
    service  = TestBed.inject(ServiceWorkerService);
    swUpdate = TestBed.inject(SwUpdate);
  });

  it('should be created', async () => {
    await expect(service).toBeTruthy();
  });

  it('should check for update', async () => {
    const spy = spyOn(swUpdate, 'checkForUpdate');
    await service.checkForUpdate();
    await expect(spy).toHaveBeenCalled();
  });

  // it('should activate update', async () => {
  //   const updateSpy = spyOn(swUpdate, 'activateUpdate');
  //   // const locationSpy = spyOn(document.location, 'reload');
  //   await service.activateUpdate();
  //   await expect(updateSpy).toHaveBeenCalled();
  //   // await expect(locationSpy).toHaveBeenCalled();
  // });
});

describe('ServiceWorkerService with Registration', () => {
  let service: ServiceWorkerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ServiceWorkerModule.register('', {enabled: true})],
    providers: [SwUpdate]
    });
  });

  it('should be created', async () => {
    service = TestBed.inject(ServiceWorkerService);
    const swUpdate: SwUpdate = TestBed.inject(SwUpdate);
    await expect(service).toBeTruthy();
    await expect(swUpdate).toBeDefined();
    await expect(service.activated).toBeDefined();
  });

  it('should catch errors while checking for updates', async () => {
    const consoleSpy = spyOn(console, 'log');
    const swUpdate: SwUpdate = TestBed.inject(SwUpdate);
    const updateSpy = spyOn(swUpdate, 'checkForUpdate').and.returnValue(Promise.reject());
    const appRef = TestBed.get(ApplicationRef) as ApplicationRef;
    service = new ServiceWorkerService(appRef, swUpdate);
    await expect(service).toBeTruthy();
    await expect(swUpdate).toBeDefined();
    await expect(service.activated).toBeDefined();
    await expect(consoleSpy).toHaveBeenCalled();
    await expect(updateSpy).toHaveBeenCalled();
  });
});
