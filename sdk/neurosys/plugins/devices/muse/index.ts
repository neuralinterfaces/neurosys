import { Devices } from "../../../core/src/plugins";
import museInfo from "./info";

export default {
    load() {
        return new Devices([ museInfo ]);
    }
}
