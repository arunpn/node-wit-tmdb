const Wit = require('node-wit').Wit;
const request = require('superagent');
var colors = require('colors/safe');
const config = require('./config.json');

const actions = {
    say: (sessionId, msg, cb) => {
        console.log(msg);
        cb();
    },
    merge: (context, entities, cb) => {
        if (entities.search_query && entities.search_query[0]) {
            if (!context.search_key) {
                context.search_key = entities.search_query[0].value;
            } else {
                
                context.selected_key = entities.search_query[0].value;
            }
        }

        cb(context);
    },
    error: (sessionId, msg) => {
        console.log('Oops, I don\'t know what to do.');
    },
    searchTMDB: (context, cb) => {
        request
            .get('https://api.themoviedb.org/3/search/movie')
            .set('Content-Type', 'application/json')
            .query({
                api_key: config.tmdb_key,
                query: context.search_key
            })
            .end(function(err, res) {
                var movieObj = res.body;
                context.movies_list_length = movieObj.total_results;
                context.movies_list = movieObj.results;
                cb(context);
            });

    },
    listMovies: (context, cb) => {
        for (var i = 0; i < context.movies_list.length; i++) {
            console.log(colors.green((i + 1).toString()) + ' ' + context.movies_list[i].original_title + '(' + context.movies_list[i].original_language + ')');
        }
        console.log('Which is the one you`ve searched for ?');
        cb(context);
    },
    showOneMovieDetails: (context, cb) => {
        console.log(context.selected_key)
        console.log(colors.green('Name : ') + context.movies_list[parseInt(context.selected_key) - 1].original_title);
        console.log(colors.green('Overview : ') + context.movies_list[parseInt(context.selected_key) - 1].overview);
        console.log(colors.green('Release Date : ') + context.movies_list[parseInt(context.selected_key) - 1].release_date);
        console.log(colors.green('Rating : ') + context.movies_list[parseInt(context.selected_key) - 1].vote_average);
        cb(context);
    }
};

const client = new Wit(config.wit_key, actions);
client.interactive();
