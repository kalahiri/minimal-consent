"use strict";

import CMP from "./CMP";


export default class NotYetImplementedCmp extends CMP {

    constructor(node, name, scriptUrl) {
        // we use WAIT for Timeframe, as we don't know if it a TCF or a non-TCF CMP.
        super(node, name, scriptUrl, CMP.cmpType.WAIT_FOR_TIME_FRAME, false);
    }

    handleCmp() {
        super.reset();
    }
}