import { OpenList } from './open-list';
import { Coordinate } from './coordinate';

export class BinaryHeap {
  heap: OpenList;

  constructor(startArray: OpenList) {
    this.heap = startArray;

    // at this index, there is the last element of the tree, before the lowest level of elements starts
    const indexLowestLevel = Math.round(startArray.length / 2) - 1;

    // make the array a binary heap
    for (let i = indexLowestLevel; i >= 0; i--) {
      this.heapify(i);
    }
  }

  /**
   * Checks at a given index, if the children have a lower value than the parent and if so, swaps them.
   * After that, it checks the given index again, if it is now on the right spot and if needed, swaps it again.
   *
   * @param index index of an element in the tree
   */
  heapify(index: number): void {
    let indexCurrentMinimum = index;
    // checks if left child element exists and has a lower value
    if (this.left(index) < this.heap.length && this.heap[this.left(index)][0] < this.heap[indexCurrentMinimum][0]) {
      indexCurrentMinimum = this.left(index);
    }
    // checks if the right child element exists and has a lower value (than the parent or even the left element)
    if (this.right(index) < this.heap.length && this.heap[this.right(index)][0] < this.heap[indexCurrentMinimum][0]) {
      indexCurrentMinimum = this.right(index);
    }

    if (indexCurrentMinimum !== index) {
      this.swap(indexCurrentMinimum, index);
      // checks if the given element is now on the right spot
      this.heapify(indexCurrentMinimum);
    }
  }

  /**
   * Adds an given element to the tree and sorts it to the right spot.
   *
   * @param newElement element to add to the tree
   */
  insert(newElement: [number, Coordinate, Coordinate, number]): void {
    const length = this.heap.length;
    // adds element to the end of the array
    this.heap.push(newElement);
    // sorts the new element to a higher position in the tree, depending on its value
    this.decrease(length, newElement[0]);
  }

  /**
   * Removes the element on the given index from the tree.
   *
   * @param index index of an element in the tree
   */
  remove(index: number): void {
    // removes the element at the given index and reduces the length of the array
    this.heap.splice(index, 1);
    // if the element was on the last position, nothing has to be changed
    if (index !== this.heap.length) {
      // depending on how the tree has changed (the values that moved up and are now head of a different branch)
      // the elements either have to move up (decrease) or to move down (heapify)
      if (index === 0 || this.heap[index][0] > this.heap[this.parent(index)][0]) {
        this.heapify(index);
      } else {
        this.decrease(index, this.heap[index][0]);
      }
    }
  }

  /**
   * Changes the value of an element and sorts it as long to a higher position, until the parent has a lower value.
   *
   * @param index index of an element in the tree
   * @param newValue the reduced or new value of the index
   */
  decrease(index: number, newValue: number): void {
    this.heap[index][0] = newValue;
    while (index > 0 && this.heap[index][0] < this.heap[this.parent(index)][0]) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  /**
   * Returns the first Element of the tree, which is the next target.
   */
  getNextTarget(): [number, Coordinate, Coordinate, number] {
    if (this.heap.length) {
      return this.heap[0];
    } else {
      return null;
    }
  }

  /**
   * Gets the index of the left child of an tree element.
   *
   * @param index index of an element in the tree
   */
  private left(index: number): number {
    return index * 2 + 1;
  }

  /**
   * Gets the index of the right child of an tree element.
   *
   * @param index index of an element in the tree
   */
  private right(index: number): number {
    return index * 2 + 2;
  }

  /**
   * Gets the index of the parent of an tree element.
   *
   * @param index index of an element in the tree
   */
  private parent(index: number): number {
    return Math.trunc((index - 1) / 2);
  }

  /**
   * Swaps two elements of the array.
   *
   * @param indexFirstElement index of an element in the tree
   * @param indexSecondElement index of an element in the tree
   */
  private swap(indexFirstElement: number, indexSecondElement: number): void {
    const value = this.heap[indexFirstElement];
    this.heap[indexFirstElement] = this.heap[indexSecondElement];
    this.heap[indexSecondElement] = value;
  }
}
