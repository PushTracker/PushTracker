import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SharedModule } from "../shared/shared.module";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./dashboard.component";

import { NativeScriptUIChartModule } from "nativescript-pro-ui/chart/angular";

import { PagerModule } from "nativescript-pager/angular";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptUIChartModule,
        DashboardRoutingModule,
	PagerModule,
        SharedModule
    ],
    declarations: [
        DashboardComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class DashboardModule { }
