import { Component } from '@angular/core';
import { NameComponent } from '../../components/name/name.component';
import { GalleryButtonComponent } from '../../components/gallery-button/gallery-button.component';
import { SwitchModeButtonComponent } from "../../components/switch-mode-button/switch-mode-button.component";
import { CameraButtonComponent } from "../../components/camera-button/camera-button.component";


@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [NameComponent, GalleryButtonComponent, SwitchModeButtonComponent, CameraButtonComponent]
})
export class HomeComponent {

}
