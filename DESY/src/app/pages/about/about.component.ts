import { Component } from '@angular/core';
import { BlockAboutComponent } from "../../components/block-about/block-about.component";

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
    imports: [ BlockAboutComponent]
})
export class AboutComponent {

}
