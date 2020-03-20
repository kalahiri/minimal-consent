"use strict";

import Utils from "../Utils";

export default class URL {

    private readonly _url: string;

    constructor(url: string) {
        if (Utils.checkIfDefinedAndNotNull(url)) {
            this._url = url;
        } else {
            throw new Error("URL String in Url must not be null");
        }
    }

    public get url(): string {
        return this._url;
    }

    public get host(): string {
        let parser = document.createElement('a');
        parser.href = this._url;
        return parser.hostname;
    }

    public get isHttp(): boolean {
        return (this._url.includes("http://") || this._url.includes("https://"));
    }

    public static classFromJson(obj: URL): URL {
        return new URL(obj.url);
    }

    public static classFromDisk(obj: URL): URL {
        return new URL(obj._url);
    }

    toJSON(): any {
        return {
            url: this._url
        }
    }
}

