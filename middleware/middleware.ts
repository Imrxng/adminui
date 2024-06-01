import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export async function requireLogin(request: Request, response: Response, next: NextFunction) {
    const token: string = request.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET ?? "super-secret", (error, user) => {
        if (error) {
            response.redirect("/login");
        } else {
            console.log(user);
            response.locals.user = user;
            next();
        };
    })
}


export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
    if (response.locals.user.role === "ADMIN") {
        next();
    } else {
        response.redirect("/onepiece/cards");
    };
};

export async function sendBack(request: Request, response: Response, next: NextFunction) {
    const token: string = request.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET ?? "super-secret", (error, user) => {
        if (error) {
            next();
        } else {
            response.redirect("/onepiece/cards");
        };
    })
}
