const { route } = require('./playerModCon');

module.exports = function(){
    const express = require('express');
    const router = express.Router();

    //get all Games
    const getGames = async (mysql) => {
        return new Promise((resolve, reject) => {
            mysql.pool.query("SELECT * FROM Games;", (error, elements) => {
                if(error){
                    return reject(error)
                }
                return resolve(elements)
            })
        })
    }

    //add a game
    const addGame = async (req, mysql) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO `Games` (time_played, duration, player_1, player_2, winner, socket_id, active_game)VALUES (?,?,?,?,?,?,?);"
            const values = [req.body.time_played, req.body.duration, req.body.player_1, req.body.player_2, req.body.winner, req.body.socket_id, req.body.active_game];
            mysql.pool.query(sql, values, (error, results, fields) => {
                if (error){
                    return reject(error)
                }
                return resolve(results)
            })
        })
    }

    //add player has games
    const addPlayerHasGames = async (playerId, insertId, mysql) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO `Player_Has_Games` (players_player_id, games_game_id) VALUES (?,?)"
            const values = [playerId, insertId];
            mysql.pool.query(sql, values, (error, results, fields) => {
                if (error){
                    return reject(error)
                }
                return resolve(results)
            })
        })
    }

    //get one game
    const getOne = async (req, id, mysql) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Games where game_id = ${id}`
            mysql.pool.query(sql, (error, elements) => {
                if(error){
                    return reject(error)
                }
                return resolve(elements)
            })
        })
    }

    //update one
    const updateOne = async (req, id, mysql) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE Games SET game_id = ?, time_played = ?, duration = ?, player_1 = ?, player_2 = ?, winner = ?, socket_id = ?, active_game = ? WHERE game_id = ${id}`
            const values = [id, req.body.time_played, req.body.duration, req.body.player_1, req.body.player_2, req.body.winner, req.body.socket_id, req.body.active_game];
            mysql.pool.query(sql, values, (error, results, fields) => {
                if (error){
                    return reject(error)
                }
                return resolve(results)
            })
        })
    }

    //delete one
    const deleteOne = async (req, id, mysql) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Games WHERE game_id = ${id}`
            mysql.pool.query(sql, (error, results, fields) => {
                if (error){
                    return reject(error)
                }
                return resolve(results)
            })
        })
    }

    /*
    ----------Routes----------
    */

    //get all games
    router.get('/', (req, res) => {
        const mysql = req.app.get('mysql');
        getGames(mysql)
            .then(games => {
                res.send(games)
            })
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
    })

    //create a game
    router.post('/', (req, res) =>{
        const mysql = req.app.get('mysql');
        addGame(req, mysql)
        .then(game => {
            addPlayerHasGames(req.body.player_1, game.insertId, mysql)
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
            addPlayerHasGames(req.body.player_2, game.insertId, mysql)
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
            
            .finally(()=> {
                res.redirect('/games')
            })
        })
        .catch(error => {
            console.log(error)
            res.status(500).send({error: "Request Failed"})
        })
    })

    //get one
    router.get('/:id', (req, res) => {
        const mysql = req.app.get('mysql');
        getOne(req, req.params.id, mysql)
            .then(one => {
                res.send(one)
            })
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
    })

    //update one
    router.put('/:id', (req, res) => {
        const mysql = req.app.get('mysql');
        updateOne(req, req.params.id, mysql)
            .then(one => {
                res.send(one)
            })
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
    })

    //delete one
    router.delete('/:id', (req, res) => {
        const mysql = req.app.get('mysql');
        deleteOne(req, req.params.id, mysql)
            .then(one => {
                res.send(one)
            })
            .catch(error => {
                console.log(error)
                res.status(500).send({error: "Request Failed"})
            })
    })

    return router;
}();
