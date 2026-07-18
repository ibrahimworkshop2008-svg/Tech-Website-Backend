
const app = require('./src/app');
const config = require('./src/config/config');
const connectDB = require('./src/config/database');

connectDB();

app.listen(config.PORT, () => {
    console.log('Server is running on port ' + config.PORT);
});