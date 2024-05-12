import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [

    {path:"about",component:AboutComponent},
    {path:"gallery",component:GalleryComponent},
    {path:"",component:HomeComponent}
];
