# Nabokos

A clone of the Sokoban puzzle game for the browser created using Angular ~~8~~ ~~9~~ ~~10~~ ~~11~~ 12.

## Goal of the Game ##

The goal of the game is to push all boxes <img src="src/assets/svg/box.svg" alt="box image" width="16px"> into target areas <img src="src/assets/png/target.png" alt="target image" width="16px"> as fast as possible (making them <img src="src/assets/svg/box_in_target.svg" alt="box in target image" width="16px">) using the least number of moves. Towards that purpose, the player <img src="src/assets/svg/player.svg" alt="player image" width="16px"> can move left, right, up and down. You cannot move diagonally or jump or fly. Any you never will, no point in asking!

Boxes can only be pushed, not pulled, so take care not push them into a corner! Also, boxes are heavy, so you can only push one box at a time, no stacking!

Luckily, you can undo moves, if you think you made a mistake. But beware, undoing a move will also be counted as a move. Of course, you can always start from the beginning, if you think you really screwed up. If you do that, the level timer and move counter will be reset.

If you beat a puzzle, the level time and the number of moves it took you will be recorded in the highscore. In accordance with our [privacy policy](https://github.com/pgerke/nabokos/blob/master/README.md#privacy-policy) the highscore is stored in the local storage of your browser and not accessible to anyone but yourself. However, you can make screenshots, if you need to brag.

## Controls ##

You can play Nabokos using a mouse, a keyboard or a touch device. While using a touch device or mouse, click or tap on the field you would like to move to, to have the player go there. Click or tap on a box while standing next to it to push it. Clicks or taps on wall tiles <img src="src/assets/svg/wall.svg" alt="wall image" width="16px"> or the floor outside the accessible puzzle area, will be ignored.

### Keyboard Bindings ###

If you want to play Nabokos with a keyboard, you can use the following controls to solve the puzzles:

* <kbd>W</kbd>, <kbd>w</kbd> or <kbd>&#8593;</kbd> to move the player up
* <kbd>A</kbd>, <kbd>a</kbd> or <kbd>&#8592;</kbd> to move the player left
* <kbd>S</kbd>, <kbd>s</kbd> or <kbd>&#8595;</kbd> to move the player down
* <kbd>D</kbd>, <kbd>d</kbd> or <kbd>&#8594;</kbd> to move the player right
* <kbd>Z</kbd>, <kbd>z</kbd> or <kbd>Backspace</kbd> to undo the last move
* <kbd>I</kbd>, <kbd>i</kbd> or <kbd>+</kbd> to zoom in
* <kbd>O</kbd>, <kbd>o</kbd> or <kbd>-</kbd> to zoom out

Moving in the direction of a box while standing next to it, will push the box, if possible.

### Zooming ###

While playing on a small device, you can easily get lost with all the boxes and walls, but don't worry, there is something you can do. For zooming outside you need two fingers touching the screen where the level is located, moving towards one another. Now you can see the bigger picture right? But, oh no, now the level is to tiny to click on a specific field! Keep calm, you can of course also zoom inside the level. It is hardly the same as zooming outside, again you need to fingers touching the screen, but now moving away from one another. Awesome right? For non touch devices you can use the keyboard bindings as shown above.

## Savegames ##

We are aware that some puzzles are ~frustrating~ challenging. So in order to prevent you from banging your head into the keyboard, we are giving you the option to save the progress for your current puzzle. Just click the <img src="src/assets/svg/save.svg" alt="wall image" width="16px"> button in the footer to create a savegame and the <img src="src/assets/svg/load.svg" alt="wall image" width="16px"> button to restore it again. Move counter and level timer will be reset to the values at the time the savegame was created. But beware: Clicking the save button again will overwrite your previous savegame! Also, you only have one savegame slot. So saving progress on another puzzle, will also overwrite your current savegame.

## System Requirements ##

* A modern browser supporting JavaScript. No, Internet Explorer, I'm not even looking at you! Shoo!
* An active connection to the internet (at least initially)</sub>
* Some kind of input device supporting one of the aforementioned control methods

Nabokos is implemented as a progressive web application ([PWA](https://en.wikipedia.org/wiki/Progressive_web_applications)) the uses service workers on supported browsers to enable users to run the application without an active connection or even as a native app after it was loaded initially. This feature is not supported by every browser or operating system.

## Privacy Policy ##

Nabokos does not use cookies or collect personal data of any kind. Period.

## Reporting Issues ##

We are happy to hear any feedback regarding the game or it's implementation, be it critizism, praise or rants about the insane difficulty level of some puzzles (yeah, we feel you...). Please create a [GitHub issue](https://github.com/pgerke/nabokos/issues) if you would like to contact us. 

We would especially appreciate, if you could report any issues you encounter while playing Nabokos, because, issues we know we probably can fix.

If you want to submit a bug report, please check if the issue you have has already been reported. If you want to contribute additional information to the issue, please add it to the existing issue instead of creating another one. Duplicate issues will take time from bugfixing and thus delay a fix.

While creating a bug report, please make it easy for us to fix it by giving us all the details you have about the issue. Always include the version of the game and a short concise description of the issue. Besides that, we are especially interested in learning about a few other topics.

### Environment ###

On which device, operating system and/or browser did you observe the issue. Feel free to include any version number you know! Example:

>Device: iPad Pro 11' (2018) <br>
>OS: iPadOS 13.2.1 <br>
>Browser: Safari

### Steps to reproduce ###

What did you have to do in order to make the issue appear. Example:

> 1. Click on the *Open* button
> 1. Enter the data in the form
> 1. Click on *Submit*

### Expected result ###

Explain in a short, concise way, what you would have expected to happen. Example:

> Form should submit

### Actual result ###

Explain in a short, concise way, what happened. Example: 

> Loading indicator shows and the form is not submitted

### Additional Information ###

Please feel free to submit any additional information that you deem useful for us in identifying and fixing the issue, like screenshots or screencasts, data on how often the bug replicates (every time, two out of three times, ..., every second Sunday). 

## Feature Requests ##

With the exception of flying or jumping, we also accept feature requests - even though we cannot guarantee if or when we will implement them...

## Last but not least

Thanks you very much for playing Nabokos! We hope you enjoy it!
