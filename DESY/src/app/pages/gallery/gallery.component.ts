import { Component } from '@angular/core';
import { GalleryButtonComponent } from "../../components/gallery-button/gallery-button.component";
import { GalleryVideoListComponent } from "../../components/gallery-video-list/gallery-video-list.component";
import { GalleryPhotoListComponent } from "../../components/gallery-photo-list/gallery-photo-list.component";

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.css',
    imports: [GalleryButtonComponent, GalleryVideoListComponent, GalleryPhotoListComponent]
})
export class GalleryComponent {

}
