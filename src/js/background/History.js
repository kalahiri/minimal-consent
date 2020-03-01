"use strict";

import Utils from "../Utils";
import PingResult from "../entities/PingResult";

const historyKeyOfStorage = "history";

export default class History {

    constructor() {
    }

    /*
    Data in Storage: {"history":[
    {"cmp":"request.cmp","cmpScriptUrl":"request.cmpScripUrl","date":"yyyy-mm-dd HH:MM:ss","implemented":"request.implemented","pingResult":"request.pingResult","url":"www.orf.at"},
    {"cmp":"TrustArc Inc","cmpScriptUrl":"//consent.truste.com/notice?domain=forbes.com&c=teconsent","date":"2020-03-01 17:37:57","implemented":true,"pingResult":{"_cmpId":41},"url":"www.forbes.com"}
    {"cmp":"Usercentrics GmbH","cmpScriptUrl":"https://app.usercentrics.eu/latest/main.js","date":"2020-03-01 17:37:45","implemented":true,"pingResult":{"_cmpId":5,"_cmpLoaded":false,"_gdprAppliesGlobally":false},"url":"usercentrics.com"}]}
     */


    load() {
        return new Promise(function (resolve, reject) {
            chrome.storage.sync.get(historyKeyOfStorage, function (result) {
                Utils.log("Data in Storage: " + JSON.stringify(result));

                if (result && result.history && result.history.length) {
                    // in this case there is already some history.
                } else {
                    // no history yet, create empty object.
                    result.history = [];
                }

                // if we are good, resolve (equal to an return, but async)
                resolve(result);
            });
        })
    }

    // https://www.freecodecamp.org/news/javascript-from-callbacks-to-async-await-1cc090ddad99/
    async save(historyItemToStore) {
        // get the data from the storage
        let history = await this.load();
        Utils.log("Data loaded");

        // check if there is an entry with this URL
        if (history.history.filter((historyItem) => historyItem.url.includes(historyItemToStore.url)).length <= 0) {
            // Adding the new Row;
            history.history.push(historyItemToStore);
            Utils.log("History Item Stored for Host: " + historyItemToStore.url);

            // sort array by date.
            history.history.sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.date) - new Date(a.date);
            });
            Utils.log("New history sorted");

            return new Promise(function (resolve, reject) {
                chrome.storage.sync.set(history, function () {
                    Utils.log('Saved new history object to Chrome Storage.');
                    // store worked, resolve now.
                    resolve();
                });
            });
        } else {
            Utils.log("There was already an Entry for: " + historyItemToStore.url + ". No need to update Data in Storage.");
        }
    }

    async getLastFound(host) {
        // get the data from the storage
        let history = await this.load();
        Utils.log("Data loaded");
        let result = {};
        for (let i = 0; i < history.history.length; i++) {
            Utils.log("Counter: " + i + ", URL: " + history.history[i].url.includes(host));
            if (history.history[i].url.includes(host)) {
                Utils.log(JSON.stringify(history.history[i]));
                result = history.history[i];
            }
        }

        Utils.log("Count: " + Object.entries(result).length);
        return result;
    }

    async getAmountOfUrlsBlocked() {
        // get the data from the storage
        let history = await this.load();
        Utils.log("Data loaded");
        return history.history.filter((historyItem) => historyItem.implemented === true).length;
    }

    clearStorage() {
        let history = {};
        history.history = {};
        return new Promise(function (resolve, reject) {
            chrome.storage.sync.set(history, function () {
                Utils.log('Storage Cleared');
                // store worked, resolve now.
                resolve();
            });
        });
    }

    doMigration() {
        return new Promise(function (resolve, reject) {
            chrome.storage.sync.get(historyKeyOfStorage, function (result) {
                Utils.log("Data in Storage: " + JSON.stringify(result));

                if (result && result.history && result.history.length) {
                    // in this case there is already some history.
                    let modification = false;
                    for (let i = 0; i < result.history.length; i++) {
                        // Okay, there is Ping Result in this Record.
                        if (typeof result.history[i].pingResult !== 'undefined' && result.history[i].pingResult !== null) {
                            Utils.log("Migration of Record: #" + i + ": " + JSON.stringify(result.history[i].pingResult));
                            let pr = PingResult.classForMigration(result.history[i].pingResult);
                            // okay, we have at lest one Element with the old Syntax:
                            if (Object.entries(pr).length > 0) {
                                // put the Update back into the storage.
                                result.history[i].pingResult = pr;
                                Utils.log("Record: " + i + " was updated, :" + JSON.stringify(result.history[i].pingResult));
                                modification = true;
                            } // else if (Ping Result is okay)
                        } // there is no Ping Result
                    } // fort

                    // save back.
                    if (modification) {
                        Utils.log("No saving again");
                        // sort array by date.
                        result.history.sort(function (a, b) {
                            // Turn your strings into dates, and then subtract them
                            // to get a value that is either negative, positive, or zero.
                            return new Date(b.date) - new Date(a.date);
                        });
                        Utils.log("New history sorted");

                        return new Promise(function (resolve, reject) {
                            chrome.storage.sync.set(result, function () {
                                Utils.log('Saved new history object to Chrome Storage.');
                                // store worked, resolve now.
                                resolve();
                            });
                        });
                    } else {
                        Utils.log("There was no modification, so there was no problem");
                    }
                }
                // if we are good, resolve (equal to an return, but async)
                resolve(result);
            });
        })
    }


}