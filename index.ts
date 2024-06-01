import express, { Express } from 'express';
import { Response, Request, NextFunction } from 'express';
import adminRout from './routers/onepiece';
import {  addUser, connect, findUser, login } from './database';
import cookieParser from "cookie-parser";
import session from './middleware/session';
import { register } from 'module';
import { send } from 'process';
import { sendBack } from './middleware/middleware';
import loginRouter from './routers/login';

const app : Express = express();
app.use(cookieParser());
app.use(session);
app.set("port", process.env.PORT || 3000);
app.use(express.static('public'));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}))
app.set("view engine", "ejs");
app.use((request: Request, response: Response, next: NextFunction) => {
    response.locals.error = undefined;
    response.locals.searchValue = request.query.filterSearch;
    response.locals.url = false;
    next();
});


app.use("/", loginRouter());
app.use("/onepiece", adminRout());

app.use((request: Request, response: Response) => {
    response.status(404);
    response.render("error");
});



app.listen(app.get("port"), async () => {
    try {
        await connect();
    } catch (error) {
        process.exit(1);
    }
    console.log(`[SERVER] started on https://localhost:${app.get("port")}`);
});

export {}
