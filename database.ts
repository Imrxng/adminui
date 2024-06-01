import { MongoClient, Collection, BulkOperationBase } from "mongodb";
import { Character, Organization, User } from "./types";
import dotenv from "dotenv";
import { fetchCharacters, fetchOrganizations } from "./functions";
import bcrypt from 'bcrypt';
import { NotBeforeError } from "jsonwebtoken";
import { error } from "console";

dotenv.config();
const saltRounds: number = 10;

const uri: string = process.env.URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);
const collectionCharacters: Collection<Character> =  client.db("tijdelijk").collection<Character>("Characters");
const collectionOrganizations: Collection<Organization> =  client.db("tijdelijk").collection<Organization>("Organizations");
const collectionUsersMilestones: Collection<User> =  client.db("tijdelijk").collection<User>("UsersMilestone");


export async function getCharacters(sortField?: string, sortDirection?: 1 | -1, searchValue?: string): Promise<Character[]> {
    // fetch indien database leeg is
    const countCharacters: number = await collectionCharacters.countDocuments();
    if (countCharacters === 0) {
        const characters: Character[] = await fetchCharacters();   
        await collectionCharacters.insertMany(characters);   
    }  

    // ophaling cards Database
    await collectionCharacters.dropIndex("*");
    await collectionCharacters.createIndex({name: "text"});
    if (searchValue && (typeof sortDirection === "number" && sortDirection === 1 || sortDirection === -1 ) && sortField) {
        return await collectionCharacters.find( { $text: {$search: searchValue} } ).sort({[sortField]: sortDirection}).toArray();                    
    } else if (sortField && sortDirection) {
        return await collectionCharacters.find({}).sort({[sortField]: sortDirection}).toArray();
    } else {
        return await collectionCharacters.find({}).toArray();   
    }
};


export async function getOrganizations(): Promise<Organization[]> {
    // ophaling organizations indien leeg is van api
    const countOrganizations: number = await collectionOrganizations.countDocuments();
    if (countOrganizations === 0) {
        const organizations: Organization[] = await fetchOrganizations();
        await collectionOrganizations.insertMany(organizations);
    };
    // ophaling database
    return await collectionOrganizations.find({}).toArray();
};

export async function editcharacter(character: Character) {
    await collectionCharacters.updateOne(
        { id: character.id }, 
        {
            $set: {
                age: character.age, 
                bounty: character.bounty,
                entryDate: character.entryDate,
                position: character.position
            }
        }
    );
};

export async function getCharacter(id: string) {
    return await collectionCharacters.findOne({id: parseInt(id)});
};

export async function login(user: User) {
    const userDatabase: User | null = await collectionUsersMilestones.findOne<User>({username: user.username});
    if (user.password && userDatabase?.password) {
        if (userDatabase) {
            if (await bcrypt.compare(user.password, userDatabase.password)) {
                return userDatabase;
            } else {
                throw new Error("User not found");
            };
        } else {
            throw new Error("User not found");
        };
    } else {  
        throw new Error("User not found");
    };
};

async function createInitialUser() {
    if (await collectionUsersMilestones.countDocuments() > 1) {
        return;
    } else {
        collectionUsersMilestones.deleteMany({});
    }
    let username : string | undefined = process.env.ADMIN_USERNAME;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (username === undefined || password === undefined) {
        throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment");
    };
    const users: User[] = [ 
        {
            username: username,
            password: await bcrypt.hash(password, saltRounds),
            role: "ADMIN"
        },
        {
            username: "user",
            password: await bcrypt.hash("supersecret", saltRounds),
            role: "USER"
        }
    ]
    await collectionUsersMilestones.insertMany(users);
};


export async function findUser(username: string) {
    return await collectionUsersMilestones.findOne({username: username});  
};


export async function addUser(user: User) {
    user = {
        username: user.username,
        password:  await bcrypt.hash(user.password!, saltRounds),
        role: "USER"
    }
    await collectionUsersMilestones.insertOne(user);
}

async function exit() {
    try {
        await client.close();
        console.log("disconnected to database");
    } catch (error: any) {
        console.error(error.message);
    } finally {
        process.exit(0);
    };
};


export async function connect() {
    await client.connect();
    await createInitialUser();
    console.log("Connected to database");
    process.on("SIGINT", exit);
};



