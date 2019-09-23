import { Component, OnInit, Input } from '@angular/core';
import { Tile } from '../models/tile';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  @Input() tile: Tile;
  @Input() isCursorHere: boolean;
  @Input() isWin: boolean;
  tiles = Tile;

  constructor() {}

  ngOnInit() {
  }
}
