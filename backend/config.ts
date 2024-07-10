import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb+srv://reedsechoco:samsungJ1@cluster0.iiqauji.mongodb.net";