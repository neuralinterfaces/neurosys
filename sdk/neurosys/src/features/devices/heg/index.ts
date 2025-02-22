import { Devices } from "../../../core/plugins";
import hegInfo from "./info";


export function load() {
    return new Devices([ hegInfo ])
}

