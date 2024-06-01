export interface Character {
    id: number;
    name: string;
    description: string;
    age: number;
    devilFruit?: string;
    entryDate: string;
    bounty: number;
    profileImageUrl: string;
    isOnline: boolean;
    position: string;
    hobbies: string[];
    group: Organization;
};

export interface Organization{
    id: number;
    name: string;
    logo: string;
    captain: string;
    base: string | null;
    territory: string;
    totalBounty: number;
};

export interface User {
    username: string;
    password?: string;
    role: "ADMIN" | "USER";
}