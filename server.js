require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
});

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, 
    `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]
function handleGetTypes(req, res) {
    res.json(validTypes);
};

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
    const {name, type} = req.query;

    if(!name) {
        return res.status(400).send('name is required')
    }

    if(type) {
        const lowerCaseValidTypes = validTypes.join(' ').toLowerCase().split(' ');
        const lowerCaseUserType = type.toLowerCase()
      
        if(!lowerCaseValidTypes.includes(lowerCaseUserType)) {
            return res.status(400).send(`type must be one of ${validTypes.join(' ')}`)
        }
    }

    let results = POKEDEX.pokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if(type) {
        results = results.filter(pokemon =>
            pokemon
            .type
            .join(' ')
            .toLowerCase()
            .split(' ')
            .includes(type.toLowerCase())
        )
    }

    res.send(results);
};

app.get('/pokemon', handleGetPokemon);

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
})
