import express from 'express';
import { Character, Organization, User } from "../types";
import { editcharacter, getCharacter, getCharacters, getOrganizations, login } from "../database";
import { requireAdmin, requireLogin } from '../middleware/middleware';



export default  function adminRout() {

    const router =  express.Router();
    
    router.get("/", (request, response) => {
        response.redirect("/login");
    });

    
    router.get("/cards", requireLogin ,async (request, response) => {

        const sortField: string  = typeof request.query.sortField === "string" ? request.query.sortField : "name";
        const sortDirection : string  = typeof request.query.sortDirection === "string" ? request.query.sortDirection : "asc";
        const sortDirectionNumber: 1 | -1 = sortDirection === "asc" ? 1 : -1;
        const filterSearch: string | undefined = typeof request.query.filterSearch === "string" ? request.query.filterSearch : undefined;
        const characters: Character[] = await getCharacters(sortField, sortDirectionNumber, filterSearch);
        const columns = [
            { field: "name", title: "Name" },
            { field: "age", title: "Age", class: "mobile" },
            { field: "bounty", title: "Bounty", class: "mobile" },
            { field: "position", title: "Position", class: "mobile" },
            { field: "isOnline", title: "Online" }
        ]; 
        response.render("cards", {
            characters: characters,
            sortDirection: sortDirection,
            sortField: sortField,
            filterSearch: filterSearch,
            url: "cards",
            columns: columns
        });
    });

    router.get("/cards/:id", requireLogin, async (request, response) => {
        let character: Character | undefined = undefined;
        const characters = await getCharacters();
        const id: number = parseInt(request.params.id);
        for (let i = 0; i < characters.length; i++) {
            if (characters[i].id === id) {
                character = characters[i];   
            };
        };
        if (!character) {
            response.status(404);
            response.render("error");
        } else {
            response.render("detailcharacter", {
                character: character
            });
        };
    });

    router.get("/cards/:id/edit", requireLogin, requireAdmin, async (request, response) => {
        let character: Character | undefined = undefined;
        const positions: string[] = ["Pirate", "Revolutionary", "Marine"];
        const characters = await getCharacters();
        const organizations = await getOrganizations();
        const id: number = parseInt(request.params.id);
        for (let i = 0; i < characters.length; i++) {
            if (characters[i].id === id) {
                character = characters[i];   
            };
        };
        if (!character) {
            response.status(404);
            response.render("error");
        } else {
            response.render("editcharacter", {
                organizations: organizations,
                character: character,
                positions: positions
            });
        };
    });

    router.post("/cards/:id/edit", requireLogin, requireAdmin, async (request, response) => {
        const theCharacter = await getCharacter(request.params.id);
        if (theCharacter) {
            const character: Character = {
                id:  theCharacter.id,
                description: theCharacter.description,
                name: theCharacter.name,
                group: theCharacter.group,
                profileImageUrl: theCharacter.profileImageUrl,
                isOnline: theCharacter.isOnline,
                hobbies: theCharacter.hobbies,
                age: parseInt(request.body.age),
                bounty: parseInt(request.body.bounty),
                entryDate: request.body.entryDate,
                position: request.body.position
            };
            await editcharacter(character);
        };
        response.redirect(`/onepiece/cards/${request.params.id}`);
    });

    router.get("/organizations", requireLogin, async (request, response) => {
        const organizations = await getOrganizations();
        response.render("organizations", {
            groups: organizations,
            url : "organizations"
        });
    });

    router.get("/organizations/:id", requireLogin, async (request, response) => {
        const characters = await getCharacters();
        const organizations = await getOrganizations();
        let character: Character = characters[0];
        let group: Organization = organizations[0];
        for (let i = 0; i < organizations.length; i++) {
            if (organizations[i].id === parseInt(request.params.id)) {
                group = organizations[i];   
            };
        };
        for (let i = 0; i < characters.length; i++) {
            if (characters[i].name === group.captain) {
                character = characters[i];   
            };
        };
        response.render("detailorganizations", {
            group: group,
            character: character
        });
    });
    return router;
};