import { Devices } from "../../../core/plugins";
import museInfo from "./info";

export default {
    load() {
        return new Devices([ museInfo ]);
    }
}
