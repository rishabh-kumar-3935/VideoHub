  import express from "express"
  import cookieParser from "cookie-parser"
  
  const app = express();

  const allowedOrigins = [
    ...new Set([
      ...(process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) || []),
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5176",
      "http://localhost:5177",
      "http://127.0.0.1:5177",
      "https://videohub-brown.vercel.app"
    ])
  ];
  const isOriginAllowed = (origin) => {
    if (!origin) return false;
    const normalizedOrigin = origin.trim();
    const isLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
    return allowedOrigins.includes(normalizedOrigin) || isLocalhostOrigin;
  };

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  // app.use(cors({
  //   origin: [
  //      "http://localhost:5173",
  //     "http://127.0.0.1:5173",
  //     "http://localhost:5174",
  //     "http://127.0.0.1:5174",
  //     "http://localhost:5175",
  //     "http://127.0.0.1:5175",
  //     "http://localhost:5176",
  //     "http://127.0.0.1:5176",
  //     "http://localhost:5177",
  //     "http://127.0.0.1:5177",
  //     "https://videohub-brown.vercel.app"
  //   ]
  // }))

  app.use(express.json({limit: "50kb"}))
  app.use(express.urlencoded({ extended: true, limit: "50kb" }))
  app.use(express.static("public"))
  app.use(cookieParser())

//routes import

import userRouter from "./routes/user.routes.js"
import healthcheckerRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import watchHistoryRouter from "./routes/watchHistory.routes.js"
import searchRouter from "./routes/search.routes.js"
import notificationRouter from "./routes/notification.routes.js"




//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/healthcheck",healthcheckerRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/history",watchHistoryRouter);
app.use("/api/v1/search",searchRouter);
app.use("/api/v1/notifications",notificationRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || err.status || err.code || 500;
  const message = err.message || "Internal Server Error";
  const success = statusCode < 400;

  res.status(statusCode).json({
    statusCode,
    success,
    message,
    data: err.data || null,
  });
});

export default app;
export {app}