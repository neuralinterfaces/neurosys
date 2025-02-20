import { Devices } from "../../../core/plugins";
import hegInfo from "./info";

export default {
    load() {
        return new Devices([ hegInfo ])
    }
}
