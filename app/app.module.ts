import { NgModule, NgModuleFactoryLoader, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HistoricalDataService } from "./shared/historical-data.service";
import { LoginService } from "./shared/login.service";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
	NativeScriptHttpModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
	HistoricalDataService,
	LoginService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
