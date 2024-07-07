import 'zone.js/dist/zone';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  concatMap,
  delay,
  exhaustMap,
  fromEvent,
  mergeMap,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

// another example: https://m-thompson-code.github.io/rxjs-maps/

type HigherOrderTypes =
  | 'switchMapField'
  | 'margeMapField'
  | 'concatMapField'
  | 'exhaustMapField';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="wrapper">
    <button
      [ngClass]="{ active: higherOrderControl.value === 'switchMapField' }"
      (click)="onHigherOrderChange('switchMapField')"
      [style.color]="colors.switchMapField"
    >
      Switch Map
    </button>

    <button
      [ngClass]="{ active: higherOrderControl.value === 'exhaustMapField' }"
      (click)="onHigherOrderChange('exhaustMapField')"
      [style.color]="colors.exhaustMapField"
    >
      Exhaust Map
    </button>

    <button
      [ngClass]="{ active: higherOrderControl.value === 'concatMapField' }"
      (click)="onHigherOrderChange('concatMapField')"
      [style.color]="colors.concatMapField"
    >
      Concat Map
    </button>

    <button
      [ngClass]="{ active: higherOrderControl.value === 'margeMapField' }"
      (click)="onHigherOrderChange('margeMapField')"
      [style.color]="colors.margeMapField"
    >
      Marge Map
    </button>
  </div>

  <!-- canvas -->
  <h2>Click somewhere on canvas. Wait time is 1.5s</h2>

  <canvas #canvas (click)="onCanvasClick($event)" class="wrapper-canvas" width="800" height="400"></canvas>

  `,
  styles: [
    `
    button {
      height: 45px;
      border: 1px solid black;
      border-radius: 8px;
    }
  
    .active {
      background-color: #b5b5b5;
    }
    
    .wrapper {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    
    .wrapper-canvas {
      margin: auto;
      margin-top: 40px;
      border: 1px solid black;
      cursor: pointer;
    }
    
    h2 {
      text-align: center;
    }
  `,
  ],
})
export class App {
  higherOrderControl = new FormControl<HigherOrderTypes>('switchMapField', {
    nonNullable: true,
  });

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  colors = {
    switchMapField: 'red',
    margeMapField: 'green',
    concatMapField: 'black',
    exhaustMapField: 'purple',
  };

  private ctx!: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    this.higherOrderControl.valueChanges
      .pipe(
        startWith(this.higherOrderControl.value),
        switchMap((type) =>
          fromEvent(this.canvas.nativeElement, 'click').pipe(
            this.resolveOperatorByType(type)((e) =>
              of(1).pipe(
                delay(1500),
                tap(() => this.drawPoint(e as MouseEvent))
              )
            )
          )
        )
      )
      .subscribe();
  }

  onHigherOrderChange(type: HigherOrderTypes): void {
    this.higherOrderControl.setValue(type);
  }

  onCanvasClick(e: MouseEvent): void {
    const color = 'yellow';
    const positionX = e.offsetX;
    const positionY = e.offsetY;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(positionX, positionY, 15, 15);

    setTimeout(() => {
      this.ctx.clearRect(positionX, positionY, 15, 15);
    }, 1500);
  }

  private resolveOperatorByType(type: HigherOrderTypes) {
    switch (type) {
      case 'switchMapField':
        return switchMap;
      case 'margeMapField':
        return mergeMap;
      case 'concatMapField':
        return concatMap;
      case 'exhaustMapField':
        return exhaustMap;
    }
  }

  private drawPoint(e: MouseEvent): void {
    const color = this.colors[this.higherOrderControl.value];
    const positionX = e.offsetX;
    const positionY = e.offsetY;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(positionX, positionY, 15, 15);
  }
}

bootstrapApplication(App);
