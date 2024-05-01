import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-name',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './name.component.html',
  styleUrl: './name.component.css'
})
export class NameComponent {

  name :string
  lastName :string
  
  onLastNameChange(event :Event) {
    let value = (event.target as HTMLInputElement).value
    this.lastName = value
  }

}
