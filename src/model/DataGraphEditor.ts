import Konva from "konva"
import { StageConfig } from "konva/lib/Stage"
import DataGraph from "./DataGraph"
import DataShape from "./DataShape"

enum EditorCursorMode {
    SELECT, DRAW_LINE, MOVE
}

class DataGraphEditor {
    constructor(containerId: string, options?: {
        onSelect?: DataGraphEditor['onSelect']
        cfg?: string | Omit<StageConfig, 'container'>
    }) {
        this.onSelect = this.onSelect
        this.dataGraph = new DataGraph(containerId, {
            onClick: () => {
                this.currentShape = undefined
                this.onSelect?.()
            },
            cfg: options?.cfg
        })

        this.dataGraph.layer.on('click', (e) => {
            if (this.cursorMode === EditorCursorMode.DRAW_LINE && this.dataGraph.currentPointerPos) {
                console.log('evt.button', e.evt.button)
                let line: Konva.Line | undefined = undefined
                const onMove = () => {
                    if (line && this.dataGraph.currentPointerPos) {
                        const originPoints = line.points()
                        originPoints[originPoints.length - 1] = this.dataGraph.currentPointerPos.y
                        originPoints[originPoints.length - 2] = this.dataGraph.currentPointerPos.x
                    }
                }

                // 左键
                if (e.evt.button === 0) {
                    line = new Konva.Line({
                        points: [
                            this.dataGraph.currentPointerPos.x, this.dataGraph.currentPointerPos.y,
                            this.dataGraph.currentPointerPos.x, this.dataGraph.currentPointerPos.y
                        ],
                        stroke: this.penColor,
                        strokeWidth: this.penWidth,
                    })
                    line.on('click', () => this.onSelect?.(line))
                    this.dataGraph.layer.on('pointermove', onMove)
                    this.dataGraph.layer.add(line)
                }

                // 右键
                if (e.evt.button === 2 && line) {
                    const originPoints = line.points()
                    line.points(originPoints.slice(0, -2))
                    this.dataGraph.layer.off('pointermove', onMove)
                }

                e.evt.preventDefault()
                e.evt.stopPropagation()
            }
        })
    }

    cursorMode: EditorCursorMode = EditorCursorMode.SELECT
    dataGraph: DataGraph
    currentShape?: DataShape
    penColor: string = '#000'
    penWidth: number = 2
    onSelect?: (s?: DataShape | Konva.Line) => void

    dropInShape(json: string, id: string) {
        const pos = this.dataGraph.currentPointerPos
        if (pos) {
            const shape = this.dataGraph.createDataShape(json, id)
            shape.group.draggable(true)
            shape.moveTo(pos)
            shape.show()

            shape.group.on('click', () => {
                if (this.cursorMode === EditorCursorMode.SELECT) {
                    this.currentShape = shape
                    this.dataGraph.transformer.nodes([shape.group])
                    this.onSelect?.(this.currentShape)
                }
            })
        }
    }
}

export default DataGraphEditor