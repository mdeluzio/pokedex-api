require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }

    console.log('Validate bearer token middleware');
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
        //Make all valid types lower case.
        const lowerCaseValidTypes = validTypes.join(' ').toLowerCase().split(' ');
        //Make user type input lower case.
        const lowerCaseUserType = type.toLowerCase()
        //Check to see if the user type input matches one of the valid inputs. Send a 400 status if no matches.
        if(!lowerCaseValidTypes.includes(lowerCaseUserType)) {
            return res.status(400).send(`type must be one of 'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 
            'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel' or 'Water'`)
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

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
