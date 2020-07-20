import { TestBed } from '@angular/core/testing';
import { ServiceWorkerService } from './service-worker.service';
import { SwUpdate, ServiceWorkerModule} from '@angular/service-worker';

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
    service = TestBed.inject(ServiceWorkerService);
  });

  it('should be created', async () => {
    const swUpdate: SwUpdate = TestBed.inject(SwUpdate);
    await expect(service).toBeTruthy();
    await expect(swUpdate).toBeDefined();
    await expect(service.activated).toBeDefined();
  });
});
