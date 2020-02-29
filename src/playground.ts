const onValueChanged = function(fn: (value: any) => void) {
  return function<T>(target: T, key: string) {
    const actuallySet = Object.getOwnPropertyDescriptor(target, key).set;
    Object.defineProperty(target, key, {
      set(val) {
        actuallySet(val);
        if (fn) fn(val);
      }
    });
  };
};

class Goz {
  @onValueChanged(console.log)
  val: number;

  constructor() {
    this.val = 5;
  }

  changeVal() {
    this.val = 6;
  }
}

const g = new Goz();
g.changeVal();
