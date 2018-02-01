import { NgModule, NgModuleFactoryLoader, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { HistoricalDataService } from "./shared/historical-data.service";
import { LoginService } from "./shared/login.service";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// for AoT compilation
export function translateLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "/i18n/", ".json");
}

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
	    NativeScriptHttpModule,
        AppRoutingModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                deps: [HttpClient],
                useFactory: (translateLoaderFactory)
            }
        })
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
