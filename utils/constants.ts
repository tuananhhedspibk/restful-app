// Strictly formating email in format "xxxx@yyyy.zzzz"
const mailRegex = new RegExp('.+@.+..+');

// Password must have at least 8 characters, at least one character and one number
const passwordRegex = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$');

export { mailRegex, passwordRegex };
