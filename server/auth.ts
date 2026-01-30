import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage.js";
import { User } from "../shared/schema.js";

export function setupAuth() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
        passReqToCallback: true
    }, async (req: any, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const googleId = profile.id;
            const name = profile.displayName;
            const intent = req.query.state; // 'login' or 'register'

            if (!email) return done(new Error("No email found from Google"), undefined);

            // 1. Check if user exists by googleId
            let user = await storage.getUserByGoogleId(googleId);

            if (!user) {
                // 2. Check if user exists by email (link account)
                user = await storage.getUserByEmail(email);

                if (user) {
                    // Link account
                    await storage.updateUserGoogleId(user.id, googleId);
                } else {
                    // Start of Modification: Check Intent
                    if (intent === 'login') {
                        // If intent is strictly login and user doesn't exist, FAIL
                        return done(null, false, { message: 'No registered account found' });
                    }
                    // End of Modification

                    // 3. Create new user (Default if intent is register or undefined)
                    user = await storage.createUser({
                        username: 'google_' + email.split('@')[0] + '_' + Math.random().toString(36).substring(7), // Generate unique username
                        name: name,
                        email: email,
                        password: null, // No password
                        role: "student",
                        googleId: googleId
                    });
                    return done(null, user, { isNewUser: true });
                }
            }
            return done(null, user, { isNewUser: false });
        } catch (err) {
            return done(err as Error, undefined);
        }
    }));

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            if (!user) {
                // User not found (e.g. deleted), invalidate session
                return done(null, false);
            }
            done(null, user);
        } catch (err) {
            console.error("Deserialization error:", err);
            // Invalidate session on error to prevent crash loop
            done(null, false);
        }
    });
}
