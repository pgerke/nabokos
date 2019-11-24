// import { Injectable, EventEmitter } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class MobileZoomService {

//   private zoomTarget: HTMLElement;
//   private zoomChanged: EventEmitter<string>;

//   private eventCache = [];
//   private previousDifference = -1;

//   constructor() { }

//   setTarget(id: string) {
//     this.zoomChanged = new EventEmitter<string>();
//     this.zoomTarget = document.getElementById(id);

//     if (this.zoomTarget) {
//       this.zoomTarget.onpointerdown = this.pointerDownHandler.bind(this);
//       this.zoomTarget.onpointermove = this.pointerMoveHandler.bind(this);

//       this.zoomTarget.onpointerup = this.pointerUpHandler.bind(this);
//       this.zoomTarget.onpointercancel = this.pointerUpHandler.bind(this);
//       this.zoomTarget.onpointerout = this.pointerUpHandler.bind(this);
//       this.zoomTarget.onpointerleave = this.pointerUpHandler.bind(this);
//     }
//   }

//   pointerDownHandler(event): void {
//     this.zoomChanged.emit('pointer Down');
//     this.eventCache.push(event);
//   }

//   pointerUpHandler(event): void {
//     this.zoomChanged.emit('pointer Up');
//     for (const item of this.eventCache) {
//       if (item.pointerId === event.pointerId) {
//         this.eventCache.splice(this.eventCache.indexOf(item), 1);
//         break;
//       }
//     }

//     if (this.eventCache.length < 2) {
//       this.previousDifference = -1;
//     }
//   }

//   pointerMoveHandler(event): void {
//     this.zoomChanged.emit('pointer Move');
//     for (const item of this.eventCache) {
//       if (item.pointerId === event.pointerId) {
//         this.eventCache[this.eventCache.indexOf(item)] = event;
//         break;
//       }
//     }
//     this.zoomChanged.emit('pointer Move 2');
//     // checks if two finger are clicking on the screen
//     if (this.eventCache.length === 2) {
//       event.preventDefault();
//       const currentDifference = Math.abs(this.eventCache[0].clientX - this.eventCache[1].clientX);
//       this.zoomChanged.emit('pointer Move 3');
//       if (this.previousDifference > 0) {
//         this.zoomChanged.emit('pointer Move 4');
//         // zoom in
//         if (currentDifference > this.previousDifference) {
//           this.zoomChanged.emit('in');
//           // zoom out
//         } else if (currentDifference < this.previousDifference) {
//           this.zoomChanged.emit('out');
//         }
//       }

//       this.previousDifference = currentDifference;
//     }

//   }

//   getZoomEmitter(): EventEmitter<string> {
//     return this.zoomChanged;
//   }

// }
