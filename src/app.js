import express from "express"

const app = express();

import cookieParser from "cookie-parser";
import cors from "cors"

// origin: process.env.CORS_ORIGIN,
app.use(cors({
    origin: "*",
}));

// app.options('*', cors());
// app.use(cors({
//     origin: 'http://localhost:5173',  // Allow requests from this origin
//     methods: ['GET', 'POST'],         // Allow specific methods if needed
//     credentials: true                 // Optional: if you're using cookies or authentication
//   }));

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

// router lekhene thau ho yo

// user Router 
import userRouter from "./routers/users.routers.js";

app.use("/api/videoSharing/v1/users", userRouter);


// video router
import videoRouter from "./routers/video.routers.js";
app.use("/api/videoSharing/v1/videos", videoRouter);

// comments routers
import commentRouter from "./routers/comments.routers.js";
app.use("/api/videoSharing/v1/comments", commentRouter);


// like routers
import likeRouter from "./routers/likes.routers.js";
app.use("/api/videoSharing/v1/likes", likeRouter);

// subscriber routers
import subscribeRoute from "./routers/subscriber.routers.js";
app.use("/api/videoSharing/v1/subscribes", subscribeRoute);



// ApiErrors Handaling

app.use((err, req, res, next) => {

    res.status(err.statusCode || 500).json({
        message: err.message || "An unknown errors occurs!",
        statusCode: err.statusCode || 500,
        data: null,
    })
});

export { app };