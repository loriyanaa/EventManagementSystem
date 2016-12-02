'use strict';

const helpers = require('../helpers');
const COUNT_OF_EVENTS = 5;

module.exports = function(data) {
    return {
        createEvent(req, res) {
            if(req.user.role === 'admin') {
                req.body.isApproved = true;
            }

            return data.createEvent(req.body, req.user)
                .then(event => {
                    res.status(200)
                            .send({ redirectRoute: '/events' });
                })
                .catch(err => {
                    res.status(400)
                        .send(JSON.stringify({ validationErrors: helpers.errorHelper(err) }));
                });
        },
        getCreateEventForm(req, res) {
            if (!req.isAuthenticated()) {
                return res.redirect('/login');
            }

            return Promise.all([data.getAllEventTypes(), data.getAllCities(), data.getAllCountries()])
                .then(([eventTypes, cities, countries]) => {
                    return res.render('event/event-create', {
                        user: req.user,
                        eventTypes,
                        cities,
                        countries
                    });
                });
        },
        getEventDetails(req, res) {
            let id = req.params.id;
            data.getEventById(id)
                .then(event => {
                    if (event.isApproved) {
                        return res.render('event/event-details', {
                            event,
                            user: req.user
                        });
                    } else {
                        return res.redirect('/events');
                    }
                })
                .catch(err => {
                    res.status(400)
                        .send(JSON.stringify({ validationErrors: helpers.errorHelper(err) }));
                });
        },
        getSpecificEvents(req, res) {
            data.getSpecificEvents(COUNT_OF_EVENTS)
                .then(events => {
                    res.send(events.forEach(event => {
                        return data.getEventById(event._id);
                    }));
                })
                .catch(err => {
                    res.status(400)
                        .send(JSON.stringify({ validationErrors: helpers.errorHelper(err) }));
                });
        },
        getEvents(req, res) {
            data.getEventsGroupedByCategories()
                .then((events => {
                    if (req.isAuthenticated() && req.user.role === 'admin') {
                        return res.render('event/event-list', {
                            events,
                            user: req.user,
                            isAdmin: true
                        });
                    } else {
                        return res.render('event/event-list', {
                            events,
                            user: req.user,
                            isAdmin: false
                        });
                    }
                }))
                .catch(err => {
                    res.status(400)
                        .send(JSON.stringify({ validationErrors: helpers.errorHelper(err) }));
                });
        },
        search(req, res) {
            let country = req.query.country,
                city = req.query.city,
                dateOfEvent = req.query.dateOfEvent,
                name = req.query.name,
                options = {};

            if (country) {
                options['country.name'] = new RegExp(country, 'i');
            }
            if (city) {
                options['city.name'] = new RegExp(city, 'i');
            }
            if (dateOfEvent) {
                options.dateOfEvent = new RegExp(dateOfEvent, 'i');
            }
            if (name) {
                options.name = new RegExp(name, 'i');
            }

            data.searchEvents(options)
                .then(events => {
                    return res.render('event/event-list', {
                        events,
                        country: country,
                        city: city,
                        dateOfEvent: dateOfEvent,
                        name: name,
                        user: req.user
                    });
                })
                .catch(err => {
                    res.status(400)
                        .send(JSON.stringify({ validationErrors: helpers.errorHelper(err) }));
                });
        }
    };
};