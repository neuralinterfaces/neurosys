import { Devices } from "../../../core/src/plugins";
import hegInfo from "./info";

export default {
    load() {
        return new Devices([ hegInfo ])
    }
}
