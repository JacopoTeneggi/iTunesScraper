import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { RunsComponent } from './runs/runs.component';
import { StatsComponent } from './stats/stats.component';
import { ToptenComponent} from './topten/topten.component';
import { HttpClientModule } from '@angular/common/http';

const appRoutes: Routes = [
  { path: 'stats', component: StatsComponent },
  { path: 'runs', component: RunsComponent },
  { path: 'topten', component: ToptenComponent},
  { path: '', redirectTo: '/runs', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    RunsComponent,
    StatsComponent,
    ToptenComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }
    ),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
