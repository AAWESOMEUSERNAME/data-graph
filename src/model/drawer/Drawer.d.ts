import { KonvaEventObject } from "konva/lib/Node";

export default interface Drawer {
    ifDrawing: () => boolean
    draw: (e: KonvaEventObject<MouseEvent>) => void
    finish: () => void
}