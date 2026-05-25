import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./shared/errors/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import articleRoutes from "./modules/article/article.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import likeRoutes from "./modules/like/like.routes.js";
import followerRoutes from "./modules/follower/follower.routes.js";
import socialRoutes from "./modules/social/social.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import recoveryRoutes from "./modules/recovery/recovery.routes.js";

const app = express();

app.set('trust proxy', 1);

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        },

        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                imgSrc: [
                    "'self'",
                    "data:",
                    "https://apiv2.franciscoalfaro.cl",
                    "https://blog.franciscoalfaro.cl"
                ],

                styleSrc: [
                    "'self'",
                    "https:",
                    "'unsafe-inline'"
                ],

                fontSrc: [
                    "'self'",
                    "https:",
                    "data:"
                ],

                scriptSrc: [
                    "'self'"
                ]
            }
        }
    })
);

app.use(cors({
    origin: [
        'https://blog.franciscoalfaro.cl',
        'https://www.blog.franciscoalfaro.cl'
    ],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'error', message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: 'error', message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
});

app.use('/api/user/login', authLimiter);
app.use('/api/recovery/request-reset', authLimiter);
app.use('/api', apiLimiter);

app.use("/api/user", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articulo", articleRoutes);
app.use("/api/categoria", categoryRoutes);
app.use("/api/comentario", commentRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/follow", followerRoutes);
app.use("/api/redes", socialRoutes);
app.use("/api/contacto", contactRoutes);
app.use("/api/recovery", recoveryRoutes);

app.use(errorHandler);

export default app;
