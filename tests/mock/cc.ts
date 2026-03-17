// Mock for Cocos Creator modules
const storage = new Map<string, string>();

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
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  subtract(v: Vec3): Vec3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
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
  position: Vec3 = new Vec3();
  worldPosition: Vec3 = new Vec3();
  scene: Node | null = null;
  private components: any[] = [];

  constructor(name: string = '') {
    this.name = name;
  }

  setPosition(x: number | Vec3, y?: number, z?: number) {
    if (x instanceof Vec3) {
      this.position = x.clone();
      return;
    }

    this.position = new Vec3(x, y ?? 0, z ?? 0);
  }

  setWorldPosition(x: number | Vec3, y?: number, z?: number) {
    if (x instanceof Vec3) {
      this.worldPosition = x.clone();
      return;
    }

    this.worldPosition = new Vec3(x, y ?? 0, z ?? 0);
  }

  addChild(child: Node) {
    child.parent = this;
    child.scene = this.scene || this;
    this.children.push(child);
  }

  getChildByName(name: string): Node | null {
    return this.children.find((child) => child.name === name) || null;
  }

  lookAt(target: Vec3) {}

  addComponent<T>(ComponentCtor: new () => T): T {
    const component = new ComponentCtor();
    if (component && typeof component === 'object' && 'node' in component) {
      (component as any).node = this;
    }
    this.components.push(component);
    return component;
  }

  getComponent<T>(ComponentCtor: new () => T): T | null {
    return (this.components.find((component) => component instanceof ComponentCtor) as T) || null;
  }

  getComponentInChildren<T>(ComponentCtor: new () => T): T | null {
    const localComponent = this.getComponent(ComponentCtor);
    if (localComponent) {
      return localComponent;
    }

    for (const child of this.children) {
      const component = child.getComponentInChildren(ComponentCtor);
      if (component) {
        return component;
      }
    }

    return null;
  }

  destroy() {}
}

export class Prefab {}

export class Component {
  node: Node = new Node();
  enabled: boolean = true;

  getComponent<T>(ComponentCtor: new () => T): T | null {
    return this.node.getComponent(ComponentCtor);
  }

  getComponentInChildren<T>(ComponentCtor: new () => T): T | null {
    return this.node.getComponentInChildren(ComponentCtor);
  }
}

export class Mesh {}

export class MeshRenderer extends Component {
  mesh: Mesh | null = null;
}

export class Camera extends Component {}

export class DirectionalLight extends Component {}

export class Canvas extends Component {}

export class UITransform extends Component {}

export const sys = {
  localStorage: {
    getItem(key: string) {
      return storage.has(key) ? storage.get(key)! : null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    }
  }
};

export class Label {
  string: string = '';
  fontSize: number = 20;
  lineHeight: number = 24;
}

export enum KeyCode {
  SPACE = 32,
  ARROW_LEFT = 37,
  ARROW_UP = 38,
  ARROW_RIGHT = 39,
  ARROW_DOWN = 40,
  KEY_A = 65,
  KEY_C = 67,
  KEY_D = 68,
  KEY_E = 69,
  KEY_L = 76,
  KEY_P = 80,
  KEY_Q = 81,
  KEY_R = 82,
  KEY_S = 83,
  KEY_T = 84,
  KEY_W = 87,
  KEY_Z = 90
}

export class EventKeyboard {
  constructor(public keyCode: KeyCode) {}
}

export const Input = {
  EventType: {
    KEY_DOWN: 'key-down'
  }
};

export const input = {
  on: jest.fn(),
  off: jest.fn()
};

export const primitives = {
  box(options?: Record<string, unknown>) {
    return { type: 'box', ...options };
  }
};

export function createMesh(geometry: Record<string, unknown>, out?: Mesh | null): Mesh {
  return out || new Mesh();
}
