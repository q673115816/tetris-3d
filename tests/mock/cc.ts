// Mock for Cocos Creator modules
export const _decorator = {
  ccclass: (name?: string) => (constructor: Function) => {},
  property: (options?: any) => (target: any, propertyKey: string) => {}
};

export class Vec3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  add(v: Vec3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vec3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  equals(v: Vec3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
}

export class Node {
  name: string = '';
  parent: Node | null = null;
  children: Node[] = [];
  active: boolean = true;
  worldPosition: Vec3 = new Vec3();

  setPosition(x: number, y: number, z: number) {}
  setWorldPosition(x: number, y: number, z: number) {}
  addChild(child: Node) { this.children.push(child); }
  destroy() {}
}

export class Prefab {}

export class Component {
  node: Node = new Node();
}