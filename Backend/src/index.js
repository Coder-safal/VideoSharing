
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import { app } from "./app.js"
import { ConnectDB } from "./db/index.db.js";
// const PORT = process.env.PORT || 3000;
const PORT = 8000;

ConnectDB()
    .then(() => {

        app.on("error", (err) => {
            console.log("Application not able to talk with database!");
        })

        app.listen(PORT, () => {
            console.log(`App is listining on port ${PORT}`);
        })

    })
    .catch((error) => {
        console.log("Connection errors in databaase!");
        throw error;
    })