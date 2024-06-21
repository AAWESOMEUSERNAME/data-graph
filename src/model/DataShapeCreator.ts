import Konva from "konva"
import { StageConfig } from "konva/lib/Stage"
import DataGraph from "./DataGraph"
import LineDrawer from "./drawer/LineDrawer"

class DataShapeCreator {
    constructor(id: string, cfg: Omit<StageConfig, 'container'>) {
        this.dataGraph = new DataGraph(id, cfg)
        const g = new Konva.Group({
            x: 0,
            y: 0
        })
        this.g = g
        g.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: this.dataGraph.stage.width(),
            height: this.dataGraph.stage.height()
        }))
        this.dataGraph.layer.add(g)

        this.lineDrawer = new LineDrawer(this.dataGraph)
        this.curveDrawer = new LineDrawer(this.dataGraph, 1)
        this.dataGraph.layer.on('click', e => {
            switch (this.mode) {
                case 'line': this.lineDrawer.draw(e); break;
                case 'curve': this.curveDrawer.draw(e); break;
                case "circle": break;
                case "rect": break;
            }
        })
    }

    private mode: 'line' | 'curve' | 'circle' | 'rect' = 'line'
    dataGraph: DataGraph
    g: Konva.Group
    lineDrawer: LineDrawer
    curveDrawer: LineDrawer
    currentCircle?: Konva.Circle
    currentRect?: Konva.Rect

    create() {
        return {
            json: this.g.toJSON(),
            dataUrl: this.g.toDataURL()
        }
    }

    changeToMode(mode: typeof this.mode) {
        if (mode !== this.mode) {
            this.lineDrawer.ifDrawing() && this.lineDrawer.finish()
            this.curveDrawer.ifDrawing() && this.curveDrawer.finish()
        }
        this.mode = mode
    }
}

export default DataShapeCreator