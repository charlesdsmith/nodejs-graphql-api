// Controller that will log a user out by deleting their secret key from the database

const Creds = require('../../models/Credential');

const LogoutController = () => {
    const logout = (req, res) => {
        var email = req.headers.email
        console.log("EMAIL", email)
        Creds.update({secret:" "}, // when the user logs out update their secret key with an empty string
            { where: {
            user_email:email,
        }}).then(data => {
            console.log("LOGOUT")
            return res.status(200).json({"message": "You have been logged out"})}
            ).catch(err => {return res.status(401).json({"message":"You're already logged out"})})
    };
    return {
        logout
    }
}

module.exports = LogoutController;