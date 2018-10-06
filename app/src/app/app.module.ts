import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SplashComponent } from './splash/splash.component';
import { AppRoutingModule } from './app-routing.module';
import { JukeboxComponent } from './jukebox/jukebox.component';
import { PlayerComponent } from './player/player.component';
import { PanelComponent } from './jukebox/panel/panel.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    JukeboxComponent,
    PlayerComponent,
    PanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
