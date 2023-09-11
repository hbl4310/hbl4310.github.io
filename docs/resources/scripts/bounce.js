// https://codepen.io/gustavohenke/pen/gOxmNWa

class DvdBounce {
    constructor(container, elem, pxPerSecond = 300) {
        this.container = container;
        this.elem = elem;
        this.updateRects();
        this.x = this.elemRect.x;
        this.y = this.elemRect.y;
        this.pxPerSecond = pxPerSecond;
        this.onBump = () => {};
    }
    
    updateRects() {
        this.containerRect = this.container.getBoundingClientRect();
        this.elemRect = this.elem.getBoundingClientRect();
    }
    
    getDuration(distance) {
        return (distance / this.pxPerSecond) * 1000;
    }
    
    async animateY(newY) {
        const anim = this.elem.animate([
        { top: `${this.y}px` },
        { top: `${newY}px` },
        ], {
        duration: this.getDuration(Math.abs(newY - this.y)),
        });
        await anim.finished;
        this.onBump();
        this.y = newY;
    }
    
    async up() {
        await this.animateY(0);
        this.down();
    }
    
    async down() {
        await this.animateY(this.containerRect.height - this.elemRect.height);
        this.up();
    }
    
    async animateX(newX) {
        const anim = this.elem.animate([
        { left: `${this.x}px` },
        { left: `${newX}px` },
        ], {
        duration: this.getDuration(Math.abs(newX - this.x)),
        });
        await anim.finished;
        this.onBump();
        this.x = newX;
    }
    
    async left() {
        await this.animateX(0);
        this.right();
    }
    
    async right() {
        await this.animateX(this.containerRect.width - this.elemRect.width);
        this.left();
    }
}

function initBounce() {
    let currentHue = 0;
    const hueRotations = [335, 30, 70, 150, 0, 220, 90, 320, 280, 110];

    const bounce = document.querySelector('.bounce');
    const dvd = new DvdBounce(bounce.parentNode, bounce, 100);
    dvd.onBump = () => {
      let hue = currentHue;
      while (hue === currentHue) {
        const index = Math.floor(Math.random() * hueRotations.length);
        hue = hueRotations[index];
      }

      bounce.style.filter = `hue-rotate(${hue}deg)`;
    };

    window.addEventListener('resize', () => {
      dvd.updateRects();
    });

    dvd.down();
    dvd.right();
}