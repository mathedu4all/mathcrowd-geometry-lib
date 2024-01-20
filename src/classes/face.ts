import { CircularLinkedList } from '../algorithms/structures/circularLinkedList'
import { Box } from './box'

export class Face extends CircularLinkedList {
  private _box: Box | undefined = undefined
  private _orientation: number | undefined = undefined
}
