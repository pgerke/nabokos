import { TestBed } from '@angular/core/testing';
import { LevelService } from './level.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('LevelService', () => {
  let service: LevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(LevelService);
  });

  it('should be created', async () => {
    await expect(service).toBeTruthy();
  });

  it('should return undefined level for out of bounds index', async () => {
    await expect(service.getLevel(-1)).toBeUndefined();
    expect(service.getLevel(service.getLevelCount() + 1));
  });

  it('should get level by index', async () => {
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
    await expect(level.name).toBe('1');
    await expect(level.serialized).toBe(refLevel);
  });

  it('should get next and previous level', async () => {
    // Simple increment
    await expect(service.getNextLevel()).toBe(1);

    // Decrement with wrap around
    await expect(service.getPreviousLevel()).toBe(service.getLevelCount() - 1);

    // Set last level
    service.getLevel(service.getLevelCount() - 1);

    // Increment with wrap around
    await expect(service.getNextLevel()).toBe(0);

    // Simple decrement
    await expect(service.getPreviousLevel()).toBe(service.getLevelCount() - 2);
  });
});
