import mongoose from "mongoose";
import { DB_NAMME } from "../constant.js";


const ConnectDB = async () => {

    try {
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAMME}`);

    } catch (error) {
        console.log("Some errors occurs while connect Database!");
        throw error;
    }
}

export { ConnectDB };