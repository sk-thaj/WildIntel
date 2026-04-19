export type ConservationStatus = "Critically Endangered" | "Endangered" | "Vulnerable" | "Near Threatened";

export type Species = {
    id: string;
    name: string;
    status: ConservationStatus;
    habitat: string;
    population: string;
    conservationActions: string[];
    lat: number;
    lng: number;
    image?: string;
    scientificName?: string;
    description?: string;
    region?: string;
    type?: string;
    populationTrend?: string;
    threats?: string[];
};

export type Sighting = {
    id: string;
    speciesName: string;
    reporter: string;
    date: string;
    notes: string;
    status: "pending" | "verified" | "rejected";
    lat: number;
    lng: number;
};

export const species: Species[] = [];
export const sightings: Sighting[] = [];
export const alerts: any[] = [];

export const getStatusBadgeClass = () => "";