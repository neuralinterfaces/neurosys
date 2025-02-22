import { Devices } from "../../../core/plugins";
import museInfo from "./info";


export function load() {
    return new Devices([ museInfo ]);
}
