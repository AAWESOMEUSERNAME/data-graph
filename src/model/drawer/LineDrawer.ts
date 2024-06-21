import Konva from "konva"
import DataGraph from "../DataGraph"
import { KonvaEventObject } from "konva/lib/Node"
import Drawer from "./Drawer"

class LineDrawer implements Drawer {
    constructor(dataGraph: DataGraph, tension?: number) {
        this.dataGraph = dataGraph
        this.tension = tension
    }

    tension?: number
    dataGraph: DataGraph
    currentLine?: Konva.Line

    ifDrawing() {
        return !!this.currentLine
    }

    private onCursorMove = () => {
        const pos = this.dataGraph.currentPointerPos
        if (this.currentLine && pos) {
            const originPoints = this.currentLine.points()
            const finalPs = originPoints.slice(0, -2).concat([pos.x, pos.y])
            this.currentLine.points(finalPs)
        }
    }

    draw(e: KonvaEventObject<MouseEvent>) {
        const currentPos = this.dataGraph.currentPointerPos
        const currentLine = this.currentLine
        if (currentPos) {
            // 左键
            if (e.evt.button === 0) {
                if (currentLine) {
                    const originPoints = currentLine.points()
                    const newPoints = originPoints.concat([currentPos.x, currentPos.y])
                    currentLine.points(newPoints)
                    const addedXIndex = newPoints.length - 2
                    this.dataGraph.addRollbackFn(() => {
                        const afterRollbackPs = Array.from(currentLine.points())
                        afterRollbackPs.splice(addedXIndex, 2)
                        currentLine.points(afterRollbackPs)
                    })
                } else {
                    this.dataGraph.startTransaction()
                    this.currentLine = new Konva.Line({
                        points: [
                            currentPos.x, currentPos.y,
                            currentPos.x, currentPos.y
                        ],
                        stroke: 'red',
                        strokeWidth: 2,
                        tension: this.tension
                    })
                    this.dataGraph.layer.on('pointermove', this.onCursorMove)
                    this.dataGraph.layer.add(this.currentLine)
                }
            }

            // 右键
            if (e.evt.button === 2 && currentLine) {
                this.finish()
            }
        }
    }

    finish() {
        const currentLine = this.currentLine
        if (currentLine) {
            const originPoints = currentLine.points()
            currentLine.points(originPoints.slice(0, -2))
            this.dataGraph.layer.off('pointermove', this.onCursorMove)
            this.dataGraph.endTransaction({
                rollbackFn: () => {
                    currentLine.destroy()
                }
            })
            this.currentLine = undefined
        }
    }
}

export default LineDrawer