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
    GlobalNotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileDropModule,
    HttpClientModule
  ],
  providers: [
    ContractsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
