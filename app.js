// * Default Imports
require("dotenv").config({ path: './config/.env' });
require("express-async-errors");

// * Named Imports
const express = require("express");
const connectDB = require("./db/connect");

// * MW's
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// * Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const reviewRoutes = require("./routes/review");
const orderRoutes = require("./routes/order");

// * Used for logging the hit routes
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require("cors");
const mongoSanitize = require('express-mongo-sanitize');

// * Cloudinary Upload
// * Cloudinary File Upload
const { v2: cloudinary } = require("cloudinary");

// * Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});



// * Variables
const PORT = process.env.PORT || 5000;
const app = express();

// * Security MW's
app.set('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60
}))
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());


// * Before Middlewares
// app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload({ useTempFiles: true }));

// * Routes
// ? Not required in production
// app.get("/", (req, res) => {
//     res.send("Ecommerce Api")
// });


// app.get("/api/v1", (req, res) => {
//     console.log(req.signedCookies);
//     res.send("Cookies PArsed")
// })

// * Custom Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);

// * AFter Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);




// * Start Our Server
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

start();
