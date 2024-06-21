import Konva from "konva"
import { Vector2d } from "konva/lib/types"

class DataShape {
    constructor(json: string, id: string) {
        this.id = id
        const node = Konva.Node.create(json)
        if (node! instanceof Konva.Group) {
            console.error('node is not Group', node)
            throw new Error('only support Konva.Group for dataShape')
        } else {
            this.group = node
            this.group.id(id)
        }
    }

    id: string
    group: Konva.Group

    moveTo(pos: Vector2d) {
        this.group.position(pos)
    }

    show() {
        this.group.show()
    }
}

export default DataShape