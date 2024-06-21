import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { StageConfig } from "konva/lib/Stage";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Vector2d } from "konva/lib/types";
import DataShape from "./DataShape";

class DataGraph {
    static LAYER_ID = 'all_layer'

    constructor(containerId: string, opt?: {
        onClick?: () => void
        cfg?: string | Omit<StageConfig, 'container'>
    }) {
        const cfg = opt?.cfg
        const onClick = opt?.onClick
        const rootNode = document.getElementById(containerId)
        if (!rootNode) {
            throw new Error("root node not exists");
        }
        const { width, height } = rootNode.getBoundingClientRect()

        if (typeof cfg === 'string') {
            this.stage = Konva.Node.create(cfg, containerId)
            const layer = this.stage.find('#' + DataGraph.LAYER_ID).find(v => v instanceof Konva.Layer) as Konva.Layer | undefined
            if (!layer) {
                this.layer = new Konva.Layer({ id: DataGraph.LAYER_ID })
                this.transformer = new Konva.Transformer()
                this.layer.add(this.transformer)
                this.stage.add(this.layer)
            } else {
                this.layer = layer
                const tf = this.layer.findOne<Transformer>('Transformer')
                if (tf) {
                    this.transformer = tf
                } else {
                    this.transformer = new Konva.Transformer()
                    this.layer.add(this.transformer)
                }
            }
        } else {
            this.stage = new Konva.Stage(Object.assign({ width, height }, cfg, { container: containerId }))
            this.layer = new Konva.Layer({ id: DataGraph.LAYER_ID })
            this.transformer = new Konva.Transformer()
            this.layer.add(this.transformer)
            this.stage.add(this.layer)
        }

        this.stage.on('pointermove', () => {
            this.currentPointerPos = this.stage.getPointerPosition();
        })

        this.stage.on('contextmenu', (e) => {
            e.evt.preventDefault()
        })
        this.stage.on('click tap', (e: KonvaEventObject<MouseEvent>) => {
            // if we are selecting with rect, do nothing
            // if (selectionRectangle.visible()) {
            //   return;
            // }

            // if click on empty area - remove all selections
            if (e.target === this.stage) {
                onClick?.()
                this.transformer.nodes([]);
                return;
            }

            // do we pressed shift or ctrl?
            // const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            // const isSelected = this.transformer.nodes().indexOf(e.target) >= 0;

            // if (!metaPressed && !isSelected) {
            //     // if no key pressed and the node is not selected
            //     // select just one
            //     tr.nodes([e.target]);
            // } else if (metaPressed && isSelected) {
            //     // if we pressed keys and node was selected
            //     // we need to remove it from selection:
            //     const nodes = tr.nodes().slice(); // use slice to have new copy of array
            //     // remove node from array
            //     nodes.splice(nodes.indexOf(e.target), 1);
            //     tr.nodes(nodes);
            // } else if (metaPressed && !isSelected) {
            //     // add the node into selection
            //     const nodes = tr.nodes().concat([e.target]);
            //     tr.nodes(nodes);
            // }
        });
    }

    stage: Konva.Stage
    /**
     * 暂时只维护一个layer，后续可能分层
     */
    layer: Konva.Layer
    private rollbackStack: Function[] = []
    private transactionStack: Function[] | undefined
    transformer: Konva.Transformer
    currentPointerPos: Vector2d | null = null

    createDataShape(json: string, id: string) {
        const shape = new DataShape(json, id)
        shape.group.hide()
        this.layer.add(shape.group)
        return shape
    }

    addRollbackFn(fn: Function) {
        if (this.transactionStack) {
            this.transactionStack.push(fn)
        } else {
            this.rollbackStack.push(fn)
        }
    }
    startTransaction() {
        this.transactionStack = []
    }
    endTransaction({rollbackFn, getRollbackFn}: {
        rollbackFn?: Function,
        getRollbackFn?: (fn: Function[]) => Function
    }) {
        const fn = rollbackFn ?? getRollbackFn?.(this.transactionStack ?? [])
        fn && this.rollbackStack.push(fn)
        this.transactionStack = undefined
    }

    rollback() {
        const fn = this.rollbackStack.pop()
        fn && fn()
    }
}

export default DataGraph