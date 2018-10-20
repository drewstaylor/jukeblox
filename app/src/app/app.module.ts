import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SplashComponent } from './splash/splash.component';
import { AppRoutingModule } from './app-routing.module';
import { JukeboxComponent } from './jukebox/jukebox.component';
import { PlayerComponent } from './player/player.component';
import { PanelComponent } from './jukebox/panel/panel.component';
import { HeaderComponent } from './header/header.component';
import { UploadComponent } from './jukebox/upload/upload.component';

import { FileDropModule } from 'ngx-file-drop';
import { HttpClientModule } from '@angular/common/http';
import { NotificationsComponent } from './services/notifications/notifications.component';
import { GlobalNotificationsComponent } from './services/notifications/global-notifications.component';

import { ContractsService } from './services/contracts.service';
import { AddSongComponent } from './jukebox/add-song/add-song.component';
import { SearchSongComponent } from './jukebox/search-song/search-song.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    JukeboxComponent,
    PlayerComponent,
    PanelComponent,
    HeaderComponent,
    UploadComponent,
    NotificationsComponent,
    GlobalNotificationsComponent,
    AddSongComponent,
    SearchSongComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileDropModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    ContractsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
