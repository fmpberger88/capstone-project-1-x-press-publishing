const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');




const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ artists: artists});
        }
    })
})

artistRouter.param('artistId', (req, res, next, artistId) => {
    db.get('SELECT * FROM Artist WHERE id = ?', [artistId], (err, artist) => {
        if (err) {
            next(err); // Leitet Fehler an die Fehlerbehandlung weiter
        } else if (artist) {
            req.artist = artist; // Hängt das gefundene Künstlerobjekt an das req-Objekt an
            next(); // Geht zur nächsten Middleware/Routen-Handler
        } else {
            res.sendStatus(404); // Sendet 404, wenn kein Künstler gefunden wurde
        }
    })
})

artistRouter.get('/:artistId', (req, res, next) => {
    // Das Künstlerobjekt ist jetzt direkt über req.artist verfügbar
    res.status(200).json({ artist: req.artist });
})

artistRouter.post('/', (req, res, next) => {
    const artist = req.body.artist;
    if (!artist.name || !artist.dateOfBirth || !artist.biography) {
        return res.sendStatus(400); // Fügt 'return' hinzu, um die Ausführung zu beenden
    }
    const isCurrentlyEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;

    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
        $name: artist.name,
        $dateOfBirth: artist.dateOfBirth,
        $biography: artist.biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };

    db.run(sql, values, function(err) { // Korrekte Platzierung der Werte
        if (err) {
            return next(err); // Fügt 'return' hinzu, um die Ausführung zu beenden
        }
        // Verwendet Parameterized Query, um SQL-Injection zu vermeiden
        db.get('SELECT * FROM Artist WHERE id = ?', [this.lastID], (err, artist) => {
            if (err) {
                return next(err); // Behandelt potenzielle Fehler beim Abrufen des neuen Künstlers
            }
            res.status(201).json({ artist: artist });
        });
    });
});

artistRouter.put('/:artistId', (req, res, next) => {
    const artist = req.body.artist;
    if (!artist.name || !artist.dateOfBirth || !artist.biography) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId'
    const values = {
        $name: artist.name,
        $dateOfBirth: artist.dateOfBirth,
        $biography: artist.biography,
        $isCurrentlyEmployed: artist.isCurrentlyEmployed,
        $artistId: req.params.artistId
    };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get('SELECT * FROM Artist WHERE id = ?', [req.params.artistId], (error, artist) => {
                if (error) {
                    return next(error);
                } else {
                    res.status(200).json({ artist: artist })
                }
            })
        }
    })
})

artistRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId';
    const values = { $artistId: req.params.artistId };

    db.run(sql, values, function(err) {
        if (err) {
            next(err); // Leitet Fehler an die Fehlerbehandlung weiter
        } else if (this.changes === 0) {
            res.sendStatus(404); // Kein Künstler mit dieser ID gefunden
        } else {
            db.get('SELECT * FROM Artist WHERE id = ?', [req.params.artistId], (err, artist) => {
                if (err) {
                    next(err); // Behandelt mögliche Fehler beim Abrufen des aktualisierten Künstlers
                } else {
                    res.status(200).json({ artist: artist }); // Sendet den aktualisierten Künstler als Antwort
                }
            });
        }
    });
});




module.exports = artistRouter;