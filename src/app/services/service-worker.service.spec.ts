import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceWorkerService } from './service-worker.service';
import { SwUpdate, ServiceWorkerModule, UpdateActivatedEvent} from '@angular/service-worker';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check for update', async () => {
    const spy = spyOn(swUpdate, 'checkForUpdate');
    await service.checkForUpdate();
    expect(spy).toHaveBeenCalled();
  });

  // it('should activate update', async () => {
  //   const updateSpy = spyOn(swUpdate, 'activateUpdate');
  //   // const locationSpy = spyOn(document.location, 'reload');
  //   await service.activateUpdate();
  //   expect(updateSpy).toHaveBeenCalled();
  //   // expect(locationSpy).toHaveBeenCalled();
  // });
});

describe('ServiceWorkerService with Registration', () => {
  let service: ServiceWorkerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ServiceWorkerModule.register('', {enabled: true})],
    providers: [SwUpdate]
    });
    service = TestBed.inject(ServiceWorkerService);
  });

  it('should be created', () => {
    const swUpdate: SwUpdate = TestBed.inject(SwUpdate);
    expect(service).toBeTruthy();
    expect(swUpdate).toBeDefined();
    expect(service.activated).toBeDefined();
  });
});
