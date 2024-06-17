import { v4 as uuidv4 } from 'uuid';

export function buildNode(id, label, children = []) {
    return {
        id,
        label,
        children,
    };
}

export function updateNode(id, newLabel, currentLevel) {
    currentLevel.forEach((node) => {
        if (node.id === id) {
            node.label = newLabel;
        }

        updateNode(id, newLabel, node.children);
    });

    return currentLevel;
}

export function addNode(parentId, label, currentLevel) {
    currentLevel.forEach((node) => {
        if (node.id === parentId) {
            node.children.push(buildNode(uuidv4(), label));
        }

        addNode(parentId, label, node.children);
    });

    return currentLevel;
}

export function deleteNode(id, currentLevel) {
    const n = currentLevel.length;

    for (let i = 0; i < n; i++) {
        const node = currentLevel[i];

        if (node.id === id) {
            currentLevel.splice(i, 1, ...node.children);
            break;
        }

        deleteNode(id, node.children);
    }

    return currentLevel;
}
