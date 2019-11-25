import { TestBed, inject } from '@angular/core/testing';
import { LevelService } from './level.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('LevelService', () => {
  let service: LevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.get(LevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return undefined level for out of bounds index', () => {
    expect(service.getLevel(-1)).toBeUndefined();
    expect(service.getLevel(service.getLevelCount() + 1));
  });

  it('should get level by index', () => {
    const refLevel = `Sasquatch I
SQ I
   ###
  ## # ####
 ##  ###  #
## $      #
#   @$ #  #
### $###  #
  #  #..  #
 ## ##.# ##
 #      ##
 #     ##
 #######`;
    const level = service.getLevel(0);
    expect(level.name).toBe('1');
    expect(level.serialized).toBe(refLevel);
  });

  it('should get next and previous level', inject([Router], router => {
    const spy = spyOn(router, 'navigate');

    // Simple increment
    service.getNextLevel();
    expect(spy).toHaveBeenCalledWith(['level', 1, true]);
    spy.calls.reset();

    // Decrement with wrap around
    service.getPreviousLevel();
    expect(spy).toHaveBeenCalledWith(['level', service.getLevelCount() - 1, true]);
    spy.calls.reset();

    // Set last level
    service.getLevel(service.getLevelCount() - 1);

    // Increment with wrap around
    service.getNextLevel();
    expect(spy).toHaveBeenCalledWith(['level', 0, true]);
    spy.calls.reset();

    // Simple decrement
    service.getPreviousLevel();
    expect(spy).toHaveBeenCalledWith(['level', service.getLevelCount() - 2, true]);
  }));
});
