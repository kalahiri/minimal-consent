"use strict";

const dateFormat = require('dateformat'); // from library

export default class Utils {

    public static log(message: string): void {
        console.log(dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l') + " " + message);
    }

    public static createMinimalConsentButton(document: any, javaScript: string): void {
        let link = document.createElement('a');
        link.text = 'Minimal Consent';
        link.setAttribute("class", "minimal-consent");
        link.href = javaScript;
        document.body.appendChild(link);
    }

    public static objectClickable(myObject: any): boolean {
        return typeof myObject !== 'undefined' && myObject && typeof myObject.parentElement !== 'undefined' && myObject.offsetParent;
    }

    public static objectVisible(myObject: any): boolean {
        return typeof myObject !== 'undefined' && myObject && typeof myObject.parentElement !== 'undefined';
    }

    public static checkIfDefinedAndNotNull(field: any): boolean {
        return typeof field !== 'undefined' && field !== null;
    }

}