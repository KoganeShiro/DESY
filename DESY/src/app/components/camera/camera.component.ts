import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {

	constructor(){}

	ngOnInit() {
		this.loadScript('assets/libs/perlin.js');
		this.loadScript('assets/libs/CCapture.js');
		this.loadScript('assets/libs/Whammy.js');
		this.loadScript('assets/libs/download.js');
		this.loadScript('assets/WarpShader.js');
		this.loadScript('assets/WarpFilter.js');
		this.loadScript('assets/TimeWarpFilter.js');
		this.loadScript('assets/FlipShader.js');
		this.loadScript('assets/FlipFilter.js');
		this.loadScript('assets/Utils.js');
		this.loadScript('assets/Renderer.js');
		this.loadScript('assets/Interface.js');
		this.loadScript('assets/Main.js');
	}

	private loadScript(src: string) {
		const script = document.createElement('script');
		script.src = src;
		script.async = false;
		script.onload = () => console.log(`${src} loaded`);
  		script.onerror = () => console.error(`Error loading ${src}`);
		document.head.appendChild(script);
	  }
}
