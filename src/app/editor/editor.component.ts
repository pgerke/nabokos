import { Component, OnInit, HostListener } from '@angular/core';
import { Coordinate, Tile } from '../models';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  cursor: Coordinate = undefined;
  tiles: Tile[][];
  selectedTool: Tile = Tile.wall;
  isPainting = false;
  mouseButton: number = undefined;
  private readonly initialColumnCount = 16;
  private readonly initialRowCount = 16;

  constructor() {
    this.newLevel();
  }

  ngOnInit() {}

  isCursorHere(x: number, y: number): boolean {
    if (!this.cursor) {
      return false;
    }
    return x === this.cursor.x && y === this.cursor.y;
  }

  newLevel() {
    this.tiles = new Array<Array<Tile>>();
    for (let i = 0; i < this.initialRowCount; i++) {
      this.tiles.push(new Array<Tile>(this.initialColumnCount));
      for (let j = 0; j < this.initialColumnCount; j++) {
        this.tiles[i][j] = Tile.floor;
      }
    }
  }

  save() {
    localStorage.setItem('editor', JSON.stringify(this.tiles));
  }
  load() {
    const tilesSerialized = localStorage.getItem('editor');
    if (!tilesSerialized) {
      return;
    }

    this.tiles = JSON.parse(tilesSerialized);
  }

  @HostListener('contextmenu', ['$event', 'true'])
  @HostListener('mousedown', ['$event', 'true'])
  @HostListener('touchstart', ['$event', 'true'])
  @HostListener('mouseup', ['$event', 'false'])
  @HostListener('touchend', ['$event', 'false'])
  setPaintState($event: MouseEvent, value: boolean): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.isPainting = value;
    this.mouseButton = $event.button;
  }

  setTile($event: Event, tile: Tile, x: number, y: number) {

    if (!($event.type === 'click' || $event.type === 'contextmenu' || this.isPainting) || !this.selectTool) {
      return;
    }

    switch (this.mouseButton) {
      case 0:
        if (this.cursor &&
          !(this.selectedTool === Tile.floor || this.selectedTool === Tile.target) &&
          this.cursor.x === x && this.cursor.y === y) {
          return;
        }

        if (this.selectedTool.toString() === 'cursor') {
          if (!(tile === Tile.floor || tile === Tile.target)) {
            return;
          }
          this.cursor = new Coordinate(x, y);
        } else {
          this.tiles[y][x] = this.selectedTool;
        }
        return;
      case 2:
        this.tiles[y][x] = Tile.floor;
        return;
      default: return;
    }
  }

  selectTool(tool: Tile) {
    this.selectedTool = tool;
    console.log('Select tool: ' + tool);
  }
}
