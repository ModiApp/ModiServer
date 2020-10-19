class CircularLinkedListNode<T> {
  data: T;
  next: CircularLinkedListNode<T> | null = null;
  constructor(data: T) {
    this.data = data;
  }
}
class CircularLinkedList<T> {
  head: CircularLinkedListNode<T> | null = null;
  constructor(elems: T[]) {
    elems.forEach(this.add);
  }

  add(elem: T) {
    const newNode = new CircularLinkedListNode(elem);
    if (this.head === null) {
      this.head = newNode;
      this.head.next = this.head;
    } else {
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next!;
      }
      temp.next = newNode;
      newNode.next = this.head;
    }
  }
}
