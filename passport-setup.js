import passport from 'passport';
import googleOAuth from 'passport-google-oauth';
import * as databaseFunctions from './database-handler.js';

const GoogleStrategy = googleOAuth.OAuth2Strategy;

export default function passportSetup() {
    passport.serializeUser(function (user, done) {
        /*
        From the user take just the id (to minimize the cookie size) and just pass the id of the user
        to the done callback
        PS: You dont have to do it like this its just usually done like this
        */
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        /*
        Instead of user this function usually recives the id 
        then you use the id to select the user from the db and pass the user obj to the done callback
        PS: You can later access this data in any routes in: req.user
        */
        done(null, user);
    });

    // Use the GoogleStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Google
    //   profile), and invoke a callback with a user object.
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}google/callback`
    },
        function (accessToken, refreshToken, profile, done) {
            databaseFunctions.getUserAccount(profile).then((account) => {
                if (account === undefined) {
                    databaseFunctions.createUserAccount(profile).then((userAccount) => {
                        return done(null, profile);
                    });
                }
                return done(null, profile)
            });
        }
    ));
}
