import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Savegame } from '../models';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ServiceWorkerService } from '../services';
import { of } from 'rxjs';

describe('MenuComponent with save game', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ServiceWorkerModule.register('', { enabled: false })
      ],
      declarations: [MenuComponent]
    }).compileComponents();
  }));

  it('should recognize savegame and allow player to continue', inject([Router], async (router: Router) => {
    spyOn(router, 'navigate');
    const savegame: Savegame = {
      moves: 123,
      levelTime: 456000,
      levelId: 789,
      level: undefined,
      history: [],
      isWin: false
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await expect(component.canContinue).toBeTruthy();
  }));
});

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let service: ServiceWorkerService;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ServiceWorkerModule.register('', { enabled: false })
      ],
      declarations: [MenuComponent],
      providers: [
        ServiceWorkerService,
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([{ path: 'menu' }, { path: 'newgame' }, { path: 'ng_Microban' }]),
          },
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(MenuComponent);
    service = TestBed.inject(ServiceWorkerService);
    spyOnProperty(service, 'isEnabled', 'get').and.returnValue(true);
    spyOnProperty(service, 'available', 'get').and.returnValue(of(true));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    await expect(component).toBeTruthy();
    await expect(component.canContinue).toBeFalsy();
  });

  it('should check for update', async () => {
    const spy = spyOn(service, 'checkForUpdate');
    await component.checkUpdate();
    await expect(spy).toHaveBeenCalled();
  });

  it('should activate update', async () => {
    const spy = spyOn(service, 'activateUpdate');
    await component.applyUpdate();
    await expect(spy).toHaveBeenCalled();
  });

  it('should get the right name', async () => {
    const setName = component.getSetName();
    await expect(setName).toBe('Microban');
  });

  it('isSetMenu should indicate if currently a set menu is shown', async () => {
    // because current path in test setup is /menu/newgame/ng_Microban/
    // so the parent is ng_Microban
    await expect(component.isSetMenu).toBeFalsy();
  });
});
