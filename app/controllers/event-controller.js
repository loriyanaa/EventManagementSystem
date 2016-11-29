'use strict';

<<<<<<< HEAD
const passport = require('passport');

const countOfEvents = 5;
module.exports = function(data) {
    return {
        createEvent(req, res) {
            return data.createEvent(req.name, req.eventType, req.location, req.description, req.dateOfEvent, req.cover, req.capacity)
                .then(event => {
                    return res.redirect(`/events/${event._id}`);
                })
                .catch(err => {
                    res.status(400)
                        .send(err);
                });
        },
        getEventDetails(req, res) {
            let id = req.params.id;
            data.getEventById(id)
                .then(event => {
                    return res.render(`events/${event._id}/details`, {
                        event,
                        user: req.user
                    });
                })
                .catch(err => {
                    res.status(400)
                        .send(err);
                });
        },
        getSpecificEvents(req, res) {
            data.getSpecificEvents(countOfEvents)
                .then(events => {
                    res.send(events.forEach(event => {
                        return data.getEventById(event._id);
                    }));
                })
                .catch(err => {
                    res.status(400)
                        .send(err);
                });
        },
        getEvents(req, res) {
            data.getAllEvents()
                .then((events => {
                    return res.render("events", {
                        events,
                        user: req.user
                    });
                }))
                .catch(err => {
                    res.status(404)
                        .send(err);
                });
        }
=======
module.exports = function (data) {
    return {
        getAll(req, res) {
            data.getAllEvents()
                .then(events => {
                    res.render('event/event-list', {
                        result: events
                    });
                });
        },
>>>>>>> bf04e2d23568bf05d36d81599633390ad0d509a4
    };
};