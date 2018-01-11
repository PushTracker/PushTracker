import { Injectable } from '@angular/core';

import { Observable, fromObject } from "data/observable";

import { Settings } from "./settings";

@Injectable()
export class SettingsService {

    public static settings: Observable = fromObject(new Settings());

    constructor() { }

}
