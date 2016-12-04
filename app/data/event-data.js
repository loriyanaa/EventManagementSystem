'use strict';

module.exports = function(models) {
    const dataUtils = require('./utils/data-utils'),
        mapper = require('../utils/mapper'),
        Event = models.Event,
        User = models.User,
        City = models.City,
        Country = models.Country,
        EventType = models.EventType;

    return {
        createEvent(eventData, user) {
            return Promise.all([
                dataUtils.loadType(EventType, eventData.eventType),
                dataUtils.loadType(Country, eventData.country),
                dataUtils.loadType(City, eventData.city)
            ])
                .then(([dbEventType, dbCountry, dbCity]) => {
                    eventData.eventType = mapper.map(dbEventType, '_id', 'name');
                    eventData.city = mapper.map(dbCity, '_id', 'name');
                    eventData.country = mapper.map(dbCountry, '_id', 'name');
                    eventData.user = { name: user.fullName, id: user.id };

                    let event = new Event(eventData);

                    return new Promise((resolve, reject) => {
                        event.save((error) => {
                            if (error) {
                                return reject(error);
                            }

                            return resolve(event);
                        });
                    });
                });
        },
        commentEvent(eventId, commentText, user){
            return new Promise((resolve, reject) => {
                let commentAuthor;

                if(user){
                    commentAuthor = user.username;
                    let commentAuthorId = user.id;
                    this.findEventByIdAndUpdate(eventId, { $push:{ comments: { text: commentText, author: commentAuthor, authorId: commentAuthorId } } });
                    return resolve(commentAuthor);
                }

                commentAuthor = 'Anonymous';
                this.findEventByIdAndUpdate(eventId, { $push:{ comments: { text: commentText, author: commentAuthor } } });
                return resolve(commentAuthor);
            });
        },
        subscribeForEvent(eventId, user){
            return new Promise((resolve, reject) => {
                this.getEventById(eventId)
                    .then((event) => {
                        let eventName=event.name;
                        let userId = user.id;
                        // let hasAlreadySubscribed = false;
                        // for (let subscribedEvent in user.subscribedEvents){
                        //     if(subscribedEvent.eventId === eventId){
                        //         hasAlreadySubscribed = true;
                        //     }
                        // }
                        //if(!hasAlreadySubscribed){
                        User.findOneAndUpdate({ _id: userId }, { $push:{ subscribedEvents: { eventId: eventId, eventName: eventName } } }, { new: true }, (err, user) => {
                            if (err) {
                                return reject(err);
                            }

                            if (!user) {
                                return reject(user);
                            }

                            return resolve(user);
                        });
                        //}
                    });
            });
        },
        getEventById(id) {
            return new Promise((resolve, reject) => {
                Event.findOne({ _id: id }, (err, event) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(event);
                });
            });
        },
        findEventByIdAndUpdate(id, update) {
            return new Promise((resolve, reject) => {
                Event.findOneAndUpdate({ _id: id }, update, { new: true }, (err, event) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!event) {
                        return reject(event);
                    }

                    return resolve(event);
                });
            });
        },
        getEventByName(name) {
            return new Promise((resolve, reject) => {
                Event.findOne({ name: name }, (err, event) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(event);
                });
            });
        },
        getSpecificEvents(count) {
            return new Promise((resolve, reject) => {
                Event.find({})
                    .sort('dateOfEvent', -1)
                    .limit(count)
                    .exec((err, resultEvents) => {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(resultEvents);
                    });
            });
        },
        getAllApprovedEvents() {
            return new Promise((resolve, reject) => {
                Event.find({ isApproved: true, isDeleted: false }, (err, events) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(events);
                });
            });
        },
        getEventsGroupedByCategories() {
            return new Promise((resolve, reject) => {
                Event.find({ isApproved: true, isDeleted: false }, (err, events) => {
                    let eventsByTypes = dataUtils.groupEvents(events);

                    if (err) {
                        return reject(err);
                    }

                    return resolve(eventsByTypes);
                });
            });
        },
        searchEvents(options) {
            options.isApproved = true;
            options.isDeleted = false;

            return new Promise((resolve, reject) => {
                Event.find(options)
                    .exec((err, resultEvents) => {
                        let groupedEvents = dataUtils.groupEvents(resultEvents);
                        if (err) {
                            return reject(err);
                        }

                        return resolve(groupedEvents || []);
                    });
            });
        },
        getAllAwaitingEvents() {
            return new Promise((resolve, reject) => {
                Event.find({ isApproved: false, isDeleted: false }, (err, events) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(events);
                });
            });
        }
    };
};