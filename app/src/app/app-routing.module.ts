import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SplashComponent } from './splash/splash.component';
import { JukeboxComponent } from './jukebox/jukebox.component';

const routes: Routes = [
    {path: '', component: SplashComponent},
    {path: 'play', component: JukeboxComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})

export class AppRoutingModule { }