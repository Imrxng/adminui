import express, { Router } from 'express';
import { Character, Organization, User } from "../types";
import { addUser, editcharacter, findUser, getCharacter, getCharacters, getOrganizations, login } from "../database";
import { requireAdmin, requireLogin, sendBack } from '../middleware/middleware';
import * as jwt from 'jsonwebtoken';


export default function loginRouter() {

    const router = Router();

    router.get("/", (request, response) => {
        response.redirect("/login");
    });
    
    router.get("/login", sendBack ,(request, response) => {    
        response.render("login", {
            word: "login",
            notification: request.session.notification
        });
    });
    
    router.get("/register", sendBack ,(request, response) => {
        response.render("login", {
            word: "register",
            notification: request.session.notification
        });
    });
    
    
    router.get("/registerReset", sendBack ,(request, response) => {
        request.session.notification = undefined;
        response.redirect("register");
    });
    
    
    router.get("/logout" ,(request, response) => {
        request.session.notification = undefined
        response.clearCookie("jwt");
        response.redirect("/login");
    });
    
    
    router.post("/login", sendBack ,async (request, response) => {
        try {
            const userBody: User = request.body;
            let user: User = await login(userBody);
            delete user.password;
            const token = jwt.sign(user, process.env.JWT_SECRET ?? "super-secret", {expiresIn: "7d"});
            response.cookie("jwt", token, {httpOnly: true, sameSite: 'lax', secure: true});
            response.redirect("/onepiece/cards");
        } catch (error: any) {
            request.session.notification = "Username or password are incorrect.";
            response.redirect("/login");
        };
    });
    
    router.post("/register", sendBack , async (request, response) => {
        const username: string = request.body.username;
        const password: string = request.body.password;
        if (username === "" || password === "") {
            request.session.notification = "Please fill username and password in.";
            response.redirect("/register");  
            return;
        } else if (await findUser(username)) {
            request.session.notification = "User already exists. Please login.";
            response.redirect("/login");
            return;
        }  else if (password.length < 8) {
            request.session.notification = "Password is too short.";
            response.redirect("/register");  
            return;
        };
        const user: User = request.body;
        await addUser(user);
        delete user.password
        const token = jwt.sign(user, process.env.JWT_SECRET ?? "super-secret", {expiresIn: "7d"});
        response.cookie("jwt", token, {httpOnly: true, sameSite: 'lax', secure: true});
        response.redirect("/onepiece/cards");
    });

    
    return router;
};