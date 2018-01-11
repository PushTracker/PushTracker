import { Injectable } from '@angular/core';
import { Http, Headers, Response } from "@angular/http";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import * as localStorage from "nativescript-localstorage";

import { DailyInfo } from "./daily-info";

@Injectable()
export class HistoricalDataService {
    // public members
    public dataSource: BehaviorSubject<Array<DailyInfo>> = new BehaviorSubject([]);

    // private members
    private static fsKeyPrefix: string = "HistoricalDataComponent.";
    private static fsKeyData: string = "Data";

    private data: Array<DailyInfo> = [];

    // public methods

    constructor() {
	this.loadFromFS();
	this.updateDataSource();
    }

    // loading
    public loadFromWeb() {
    }

    public loadFromFS() {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
	    this.data = (localStorage.getItem(key) || []).map((d) => {
		return new DailyInfo(d);
	    });
	}
	catch (ex) {
	    console.log(`couldn't load HistoricalData: ${ex}`);
	}
    }

    // saving
    public saveToFS() {
	try {
	    const key = HistoricalDataService.fsKeyPrefix + HistoricalDataService.fsKeyData;
	    localStorage.setItem(key, this.data);
	}
	catch (ex) {
	    console.log(`couldn't save HistoricalData: ${ex}`);
	}
    }

    public saveToWeb() {
    }

    // modifying
    private add(dailyInfo: DailyInfo): void {
	const sameDates = this.data.filter((di) => {
	    return dailyInfo.sameAsDailyInfo(di);
	});
	if (sameDates.length > 1) {
	    console.log(`error: multiple days with the same date: ${dailyInfo.getDate()}`);
	    return;
	}
	else if (sameDates.length === 1) {
	    const index = this.data.indexOf(sameDates[0]);
	    this.data[index] = dailyInfo;
	}
	else {
	    this.data.push(dailyInfo);
	}
    }
    
    public update(dailyInfo: DailyInfo): void {
	this.add(dailyInfo);
	this.updateDataSource();
	this.saveToFS();
    }

    public updateFromArray(array: Array<DailyInfo>): void {
	array.map((di) => {
	    this.add(di);
	});
	this.updateDataSource();
	this.saveToFS();
    }

    public initFromArray(array: Array<DailyInfo>): void {
	this.data.splice(0, this.data.length, ...array);
	this.updateDataSource();
	this.saveToFS();
    }

    public clear(): void {
	this.data.splice(0, this.data.length);
	this.updateDataSource();
	this.saveToFS();
    }

    // private methods
    private updateDataSource(): void {
	if (this.data.length) {
	    this.dataSource.next([...this.data]);
	}
	else {
	    this.dataSource.next([]);
	}
    }
    
    private handleErrors(error: Response) {
	console.log(JSON.stringify(error.json()));
	return Observable.throw(error);
    }

    private convertData(dailyInfo: DailyInfo): void {
	const convert = {
	    "coastWith": 100.0,
	    "coastWithout": 100.0,
	    "distance": 10.0,
	    "speed": 10.0
	};
	Object.keys(convert).map((k) => {
	    if (dailyInfo[k]) {
		dailyInfo[k] = dailyInfo[k] / convert[k];
	    }
	});
    }

}
