import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const GOOGLE_CLIENT_ID     = process.env.Google_client_id;
const GOOGLE_CLIENT_SECRET = process.env.Google_client_secret;

export const oauth2client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "postmessage"   // ← was "Postmessage" (capital P) — must be all lowercase
);