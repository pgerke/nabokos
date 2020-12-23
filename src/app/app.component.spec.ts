import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let app: AppComponent;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        AppComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', async() => {
    await expect(app).toBeTruthy()
  });

  it('should have as title \'nabokos\'', async() => {
    await expect(app.title).toEqual('nabokos');
  });
});
