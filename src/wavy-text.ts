type Attribute =
  | "text"
  | "start"
  | "amplitude"
  | "frequency"
  | "phase"
  | "offset"
  | "color"
  | "background";

const defaultAttributeValues = {
  start: 0,
  amplitude: 15,
  frequency: 0.02,
  phase: 0.02,
  offset: 1,
  color: "inherit",
  background: "none",
};

class WavyText extends HTMLElement {
  text = "";
  start = defaultAttributeValues.start;
  amplitude = defaultAttributeValues.amplitude;
  frequency = defaultAttributeValues.frequency;
  phase = defaultAttributeValues.phase;
  offset = defaultAttributeValues.offset;
  color = defaultAttributeValues.color;
  background = defaultAttributeValues.background;
  letters: { el: HTMLSpanElement; lOffset: number; tOffset: number }[] = [];
  RAFRef = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = `<div style="position: relative; display: inline-block"></div>`;
  }

  connectedCallback() {
    this.startAnimation();

    let prevWidth = window.innerWidth;

    window.addEventListener("resize", (e) => {
      if (window.innerWidth != prevWidth) {
        prevWidth = window.innerWidth;
        this.constructDOM();
        this.setLetterArray();
      }
    });
  }

  disconnectedCallback() {
    window.cancelAnimationFrame(this.RAFRef);
  }

  static get observedAttributes(): Attribute[] {
    return [
      "text",
      "start",
      "amplitude",
      "frequency",
      "phase",
      "offset",
      "color",
      "background",
    ];
  }

  startAnimation() {
    window.cancelAnimationFrame(this.RAFRef);
    this.RAFRef = window.requestAnimationFrame(() => this.sine(this.start));
  }

  stopAnimation() {
    window.cancelAnimationFrame(this.RAFRef);
  }

  attributeChangedCallback(attrName: Attribute, _oldVal: any, newVal: string) {
    switch (attrName) {
      case "text":
        this.text = newVal.trim();
        this.constructDOM();
        this.setLetterArray();
        break;
      case "offset":
        this.offset = parseFloat(newVal) || defaultAttributeValues.offset;
        break;
      case "color":
        this.color = newVal.trim() || defaultAttributeValues.color;
        this.constructDOM();
        this.setLetterArray();
        break;
      case "background":
        if (newVal.trim() === "none") {
          this.background = "rgb(0 0 0 / 0)";
        } else {
          this.background = newVal.trim() || defaultAttributeValues.background;
        }
        this.constructDOM();
        this.setLetterArray();
        break;
      case "start":
        this.start = parseFloat(newVal) || defaultAttributeValues.start;
        break;
      case "amplitude":
        this.amplitude = parseFloat(newVal) || defaultAttributeValues.amplitude;
        break;
      case "frequency":
        this.frequency = parseFloat(newVal) || defaultAttributeValues.frequency;
        break;
      case "phase":
        this.phase = parseFloat(newVal) || defaultAttributeValues.phase;
        break;
    }
  }

  constructDOM() {
    const container = this.shadowRoot!.querySelector("div") as HTMLDivElement;
    container.innerHTML = "";

    const words = this.text.split(" ");
    words.forEach((word, i) => {
      const innerText = i === words.length - 1 ? word : word + "\xa0";
      const wordSpan = document.createElement("span") as HTMLSpanElement;
      wordSpan.style.display = "inline-block";

      for (let i = 0; i < innerText.length; i++) {
        const letterSpan = document.createElement("span") as HTMLSpanElement;
        letterSpan.style.display = "inline-block";
        letterSpan.style.color = this.color;
        letterSpan.style.backgroundColor = this.background;
        letterSpan.innerText = innerText[i];
        wordSpan.appendChild(letterSpan);
      }

      container.appendChild(wordSpan);
    });
  }

  setLetterArray() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.letters = [];
          const container = this.shadowRoot!.querySelector(
            "div"
          ) as HTMLDivElement;
          const wordElements =
            container.childNodes as NodeListOf<HTMLSpanElement>;
          wordElements.forEach((wordEl) => {
            const letterElements =
              wordEl.childNodes as NodeListOf<HTMLSpanElement>;
            letterElements.forEach((letterEl) => {
              this.letters.push({
                el: letterEl,
                lOffset: letterEl.offsetLeft,
                tOffset: letterEl.offsetTop,
              });
            });
          });
        });
      });
    });
  }

  sine(t: number) {
    this.letters.forEach((letter) => {
      const offset = letter.tOffset * this.offset;
      letter.el.style.transform = `translateY(${
        this.amplitude * Math.sin(letter.lOffset * this.frequency + t + offset)
      }px)`;
    });

    this.RAFRef = window.requestAnimationFrame(() =>
      this.sine((t += this.phase))
    );
  }
}

export default customElements.define("wavy-text", WavyText);
