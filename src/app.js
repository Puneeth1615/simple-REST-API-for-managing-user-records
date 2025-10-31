const express = require('express');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(express.json());

app.use('/', userRoutes); 

app.use((err, req, res, next) => {
    console.error(err.stack); 
    
    res.status(500).send({ 
        message: 'An unexpected server error occurred.', 
        details: err.message 
    });
});

module.exports = app;