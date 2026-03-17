import { Mesh, MeshRenderer, Node, Vec3, createMesh, primitives } from 'cc';

let cachedBlockMesh: Mesh | null = null;
const cachedBoxMeshes = new Map<string, Mesh>();

function getBlockMesh(): Mesh {
    if (!cachedBlockMesh) {
        cachedBlockMesh = createMesh(primitives.box({
            width: 0.95,
            height: 0.95,
            length: 0.95,
        }));
    }

    return cachedBlockMesh;
}

function getBoxMesh(size: Vec3): Mesh {
    const key = `${size.x}_${size.y}_${size.z}`;
    const cachedMesh = cachedBoxMeshes.get(key);
    if (cachedMesh) {
        return cachedMesh;
    }

    const mesh = createMesh(primitives.box({
        width: size.x,
        height: size.y,
        length: size.z,
    }));

    cachedBoxMeshes.set(key, mesh);
    return mesh;
}

export function createVisibleBlockNode(name: string, position: Vec3, parent?: Node | null): Node {
    const blockNode = new Node(name);

    if (parent) {
        parent.addChild(blockNode);
    }

    blockNode.setPosition(position);

    const meshRenderer = blockNode.addComponent(MeshRenderer);
    meshRenderer.mesh = getBlockMesh();

    return blockNode;
}

export function createVisibleBoxNode(name: string, position: Vec3, size: Vec3, parent?: Node | null): Node {
    const boxNode = new Node(name);

    if (parent) {
        parent.addChild(boxNode);
    }

    boxNode.setPosition(position);

    const meshRenderer = boxNode.addComponent(MeshRenderer);
    meshRenderer.mesh = getBoxMesh(size);

    return boxNode;
}
