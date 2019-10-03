import { TestBed } from '@angular/core/testing';
import { LevelService } from './level.service';

describe('LevelService', () => {
  let service: LevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(LevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get current level', () => {
    const refLevel = `   ###
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
    const level = service.getCurrentLevel();
    expect(level.name).toBe('Level 1');
    expect(level.serialized).toBe(refLevel);
  });

  it('should get next and previous level', () => {
    const refLevel1 = `   ###
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
    const refLevel2 = ` ## #####
## ## . #
# ## $. #
 ## $   #
## $@ ###
# $  ##
#.. ## ##
#   # ##
##### #^`;
    let level = service.getNextLevel();
    expect(level.name).toBe('Level 2');
    expect(level.serialized).toBe(refLevel2);
    level = service.getPreviousLevel();
    expect(level.name).toBe('Level 1');
    expect(level.serialized).toBe(refLevel1);
  });

  it('should get next and previous level with wrap around', () => {
    const refLevel1 = `   ###
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
    const refLevel2 = `##############################
# .$ ## $. ## .$ ## $. ## .$ #
#$  .  .  $##$  .  .  $##$  .#
#.  $##$  .  .  $##$  .  .  $#
# $. ## .$ ## $. ## .$ ## $. #
### #  # ##  ## #  # ##  ## ##
### #  # ## #  . # # ##  ## ##
# $. ## .$ #   $  # .$ ## $. #
#.  $##$  . .$##  #$  .  .  $#
#$  .  .  $#  @#$. .  $##$  .#
# .$ ## $. #  $   # $. ## .$ #
## ##  ## # # .  # ## #  # ###
## ##  ## #  # ##  ## #  # ###
# .$ ## $. ## .$ ## $. ## .$ #
#$  .  .  $##$  .  .  $##$  .#
#.  $##$  .  .  $##$  .  .  $#
# $. ## .$ ## $. ## .$ ## $. #
##############################`;
    let level = service.getPreviousLevel();
    expect(level.name).toBe('Level 355');
    expect(level.serialized).toBe(refLevel2);
    level = service.getNextLevel();
    expect(level.name).toBe('Level 1');
    expect(level.serialized).toBe(refLevel1);
  });
});
