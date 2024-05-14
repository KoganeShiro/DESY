import { Component } from '@angular/core';
import { NameComponent } from '../../components/name/name.component';
import { GalleryButtonComponent } from '../../components/gallery-button/gallery-button.component';


@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [NameComponent, GalleryButtonComponent]
})
export class HomeComponent {
    isVideo : boolean;
    toggleVideo() {
        this.isVideo = !this.isVideo;
    }
}


