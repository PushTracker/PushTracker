import application = require("application");

/// <reference types="@types/datejs" />
import { Component, ChangeDetectionStrategy, ElementRef, Injectable, OnInit, ViewChild, NgZone } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { SegmentedBar, SegmentedBarItem } from "ui/segmented-bar";
import { RadCartesianChart, LinearAxis, DateTimeContinuousAxis, DateTimeCategoricalAxis, BarSeries } from "nativescript-pro-ui/chart";

import { ObservableArray } from "data/observable-array";

import { alert, confirm, prompt, inputType } from "ui/dialogs";

import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

import { HistoricalDataService } from "../shared/historical-data.service";
import { DailyInfo } from "../shared/daily-info";

require("../shared/date");

@Component({
    selector: "Dashboard",
    moduleId: module.id,
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    /* ***********************************************************
    * Use the @ViewChild decorator to get a reference to the drawer component.
    * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
    *************************************************************/
    @ViewChild("drawer") drawerComponent: RadSideDrawerComponent;

    @ViewChild("pushesXAxis") pushesXAxis: ElementRef;
    @ViewChild("coastXAxis") coastXAxis: ElementRef;
    @ViewChild("drivingXAxis") drivingXAxis: ElementRef;

    // public members
    public isIOS: boolean = false;
    public isAndroid: boolean = false;
    
    public times: Array<string> = ["Year", "Month", "Week"];
    public timeSelections: Array<SegmentedBarItem>;
    public selectedTime: string = this.times[2];

    public average: DailyInfo = new DailyInfo();

    public historicalData: ObservableArray<DailyInfo> = new ObservableArray([]);

    // private members
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor(private historicalDataService: HistoricalDataService, private _ngZone: NgZone) {
        this.timeSelections = [];
        this.times.map((t) => {
            const item = new SegmentedBarItem();
            item.title = t;
            this.timeSelections.push(item);
        });
	this.historicalDataService.dataSource.subscribe(
	    (x) => this.updateData(x),
	    (err) => console.log(err),
	    () => console.log("subscription completed")
	);
    }

    public updateData(newData): void {
	this._ngZone.run(() => {
	    if (newData.length) {
		this.historicalData.splice(0, this.historicalData.length, ...newData)
	    }
	    else {
		this.historicalData.splice(0, this.historicalData.length);
	    }
	    this.updateAxes();
	});
    }

    public zeroAverages(): void {
	const keys = [ "pushesWith", "pushesWithout", "coastWith", "coastWithout", "distance", "speed"];
	keys.map((k) => {
	    this.average[k] = 0;
	});
    }

    public updateAverages(min, max): void {
	const keys = [ "pushesWith", "pushesWithout", "coastWith", "coastWithout", "distance", "speed"];
	const sums = {};
	this.zeroAverages();
	keys.map((k) => {
	    sums[k] = 0;
	});
	if (this.historicalData.length > 0) {
	    let sum = 0;
	    let num = 0;
	    this.historicalData.map((d) => {
		if (d.date >= min.getTime() && d.date <= max.getTime()) {
		    keys.map((k) => {
			sums[k] += d[k];
		    });
		    num++;
		}
	    });
	    if (num > 0) {
		keys.map((k) => {
		    this.average[k] = sums[k] / num;
		});
	    }
	}
    }

    public updateAxes(): void {
	let minimum = (7).days().ago();
	let maximum = (0).days().ago();
	let dateFormat = "MMM d";
	let majorStep = "Day";
	let labelFitMode = "None";
	switch (this.selectedTime) {
	default:
	case "Week":
	    break;
	case "Month":
	    minimum = Date.today().addWeeks(-4);
	    majorStep = "Week";
	    break;
	case "Year":
	    minimum = (12).months().ago();
	    dateFormat = "MMM";
	    majorStep = "Month";
	    break;
	}

	if (this.isIOS) {
	    labelFitMode = "Rotate";
	}

	this.updateAverages(minimum, maximum);

	const axesArray = [ this.pushesXAxis, this.coastXAxis, this.drivingXAxis ];
	axesArray.map((a) => {
	    if (a !== null && a !== undefined) {
		const xAxis = <DateTimeContinuousAxis>a.nativeElement;
		xAxis.minimum = minimum;
		xAxis.maximum = maximum;
		xAxis.majorStep = majorStep;
		xAxis.dateFormat= dateFormat;
		xAxis.labelFitMode = labelFitMode;
	    }
	});
    }

    public onSelectedIndexChange(args): void {
        const segmentedBar = <SegmentedBar>args.object;
        this.selectedTime = this.times[segmentedBar.selectedIndex];
	//this.updateData(this.historicalData.slice());
	this.updateAxes();
    }

    public trackBallContentRequested(args): void {
	/*
	console.log("trackball content requested!");
	console.log(Object.keys(args));
	*/
    }

    private getRandomRange(min: number, max: number): number {
	return Math.random() * (max-min) + min;
    }

    public onDashboardInitTap(): void {
	const options = {
	    title: "How many days?",
	    defaultText: "200",
	    cancelButtonText: "Cancel",
	    okButtonText: "Ok",
	    inputType: inputType.text
	};
	prompt(options).then((result) => {
	    if (!result.result) {
		return;
	    }
	    const numDays = parseInt(result.text);
	    if (numDays <= 0 || numDays === NaN) {
		return;
	    }
	    this.historicalDataService.clear();
	    const diArray = [];
	    for (let i=numDays; i >= 0; i--) {
		let d = (i).days().ago();
		let di = new DailyInfo({
		    year: d.getFullYear(),
		    month: d.getMonth() + 1,
		    day: d.getDate(),
		    pushesWith: this.getRandomRange(10, 100),
		    pushesWithout: this.getRandomRange(50, 200),
		    coastWith: this.getRandomRange(1, 50),
		    coastWithout: this.getRandomRange(0.5, 1.2),
		    distance: this.getRandomRange(0.5, 9.0),
		    speed: this.getRandomRange(0.1, 6.0)
		});
		diArray.push(di);
	    }
	    this.historicalDataService.initFromArray(diArray);
	});
    }

    public onDashboardClearTap(): void {

        let options = {
            title: "Clear Historical Data",
            message: "Are you sure you want to delete all historical data?",
            okButtonText: "Yes",
            cancelButtonText: "No",
            neutralButtonText: "Cancel"
        };

        confirm(options).then((result: boolean) => {
	    if (result) {
		this.historicalDataService.clear();
	    }
        });
    }

    public onDataTap(data): void {
	alert({
	    title: "Daily Info",
	    message: JSON.stringify(data, null, 2),
	    okButtonText: "Ok"
	});
    }

    /* ***********************************************************
    * Use the sideDrawerTransition property to change the open/close animation of the drawer.
    *************************************************************/
    ngOnInit(): void {
        this._sideDrawerTransition = new SlideInOnTopTransition();
	if (application.ios) {
	    this.isIOS = true;
	} else if (application.android) {
	    this.isAndroid = true;
	}
    }

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    /* ***********************************************************
    * According to guidelines, if you have a drawer on your page, you should always
    * have a button that opens it. Use the showDrawer() function to open the app drawer section.
    *************************************************************/
    public onDrawerButtonTap(): void {
        this.drawerComponent.sideDrawer.showDrawer();
    }
}
