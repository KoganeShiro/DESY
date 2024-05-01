import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';

export const routes: Routes = [

    {path:"gallery",component:GalleryComponent},
    {path:"",component:HomeComponent}
];
