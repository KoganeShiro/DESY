import { Component } from '@angular/core';
import { NameComponent } from '../name/name.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NameComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
