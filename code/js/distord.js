import * as THREE from 'three';

const img = document.querySelector('.img');

let current = 0;
let target = 0;
let ease = 0.075;

//Linear Interpolation 
function lerp(start, end, i) {
    return start * (1 - i) + end * i;
}

function ini() {
    document.body.style.height = `${img.getBoundingClientRect().height}px`;
}

function smoothScroll() {
    target = window.scrollY;
    current = lerp(current, target, ease);
    img.style.transform = `translate3d(0, ${-current}px, 0)`;
    requestAnimationFrame(smoothScroll);
}

class EffectCanvas {
    constructor() {
        this.div = document.querySelector('main')
    }
}

init()