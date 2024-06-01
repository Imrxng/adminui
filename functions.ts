import { Character , Organization} from "./types";

export async function fetchOrganizations(): Promise<Organization[]> {
    const response = await fetch("https://raw.githubusercontent.com/Imrxng/fotosProjectWEB/main/groups.json");
    const data: Organization[] = await response.json();
    return data;
};

export async function fetchCharacters(): Promise<Character[]> {
    const response = await fetch("https://raw.githubusercontent.com/Imrxng/fotosProjectWEB/main/characters.json");
    const data: Character[] = await response.json();
    return data;
};