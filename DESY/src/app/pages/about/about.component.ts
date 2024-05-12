import { Component } from '@angular/core';
import { GradientBackgroundComponent } from "../../components/gradient-background/gradient-background.component";
import { BlockAboutComponent } from "../../components/block-about/block-about.component";

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
    imports: [GradientBackgroundComponent, BlockAboutComponent]
})
export class AboutComponent {

}
