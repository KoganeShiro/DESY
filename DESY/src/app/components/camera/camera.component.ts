import { Component } from '@angular/core';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent {
	threejs: HTMLScriptElement;
	perlinjs: HTMLScriptElement;
	ccapturejs: HTMLScriptElement;
	whammyjs: HTMLScriptElement;
	downloadjs: HTMLScriptElement;
	warpShader: HTMLScriptElement;
	warpFilter: HTMLScriptElement;
	timeWarpFilter: HTMLScriptElement;
	flipShader: HTMLScriptElement;
	flipFilter: HTMLScriptElement;
	utils: HTMLScriptElement;
	renderer: HTMLScriptElement;
	interface: HTMLScriptElement;
	main: HTMLScriptElement;

	constructor(){
		this.threejs = document.createElement("threejs");
		this.threejs.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
		document.head.appendChild(this.threejs);

		this.perlinjs = document.createElement("perlinjs");
		this.perlinjs.src = "DESY/src/assets/libs/perlin.js";
		document.head.appendChild(this.perlinjs);

		this.ccapturejs = document.createElement("ccapturejs");
		this.ccapturejs.src = "DESY/src/assets/libs/CCapture.js";
		document.head.appendChild(this.ccapturejs);

		this.whammyjs = document.createElement("whammyjs");
		this.whammyjs.src = "DESY/src/assets/libs/Whammy.js";
		document.head.appendChild(this.whammyjs);

		this.downloadjs = document.createElement("downloadjs");
		this.downloadjs.src = "DESY/src/assets/libs/download.js";
		document.head.appendChild(this.downloadjs);

		this.warpShader = document.createElement("warpShader");
		this.warpShader.src = "DESY/src/assets/WarpShader.js";
		document.head.appendChild(this.warpShader);

		this.warpFilter = document.createElement("warpFilter");
		this.warpFilter.src = "DESY/src/assets/CCapture.js";
		document.head.appendChild(this.warpFilter);

		this.utils = document.createElement("utils");
		this.utils.src = "DESY/src/assets/CCapture.js";
		document.head.appendChild(this.utils);

		this.renderer = document.createElement("renderer");
		this.renderer.src = "DESY/src/assets/CCapture.js";
		document.head.appendChild(this.renderer);

		this.interface = document.createElement("interface");
		this.interface.src = "DESY/src/assets/CCapture.js";
		document.head.appendChild(this.interface);

		this.main = document.createElement("main");
		this.main.src = "DESY/src/assets/CCapture.js";
		document.head.appendChild(this.main);
	}
}
