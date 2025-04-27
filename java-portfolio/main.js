const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0xcRF0X3JvAMypBv-HPQpBy9TvH74KtqEP5QhnPR6VAL0AELJtWNt7dtWuF3NQNA-8l4IWGaJk4kA/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();

const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};




const bgColors = ["#e281d3"];
const json = csvToJson(csvText);
console.log(json);

const $projets = document.querySelector(".projets");

// parcourir le json et créer les éléments
json.forEach((item) => {
  const div = document.createElement("div");
  $projets.appendChild(div);
  div.classList.add("projet");
  // gsap.set(div,{backgroundColor: e => gsap.utils.random(bgColors)});
  // gsap.from(div, {
  //   x: e=> gsap.utils.random(-1000,1000),
  //   y : e  => gsap.utils.random(-1000,-20),
  //   opacity:0, duration: 0.5 });

  const img = document.createElement("img");
  // Check if the image exists before assigning it
  const sanitizedTitle = sanitizeName(item.titre);
  const imagePath = `img/${sanitizedTitle}.png`;
  
  fetch(imagePath, { method: 'HEAD' })
    .then((response) => {
      if (response.ok) {
        img.src = imagePath;
      } else {
        console.warn(`Image not found: ${imagePath}`);
        img.src = 'img/default.png'; // Fallback image
      }
    })
    .catch((error) => {
      console.error(`Error fetching image: ${imagePath}`, error);
      img.src = 'img/default.png'; // Fallback image
    });
  div.appendChild(img);
 

  // Remove the title creation from here
  // const titre = document.createElement("h2");
  // titre.textContent = item.titre;
  // div.appendChild(titre);

 

  // const categories = document.createElement("div");
  // categories.textContent = item.titre;
  // div.appendChild(titre);

  // const description = document.createElement("p");
  // description.textContent = item.description;
  // div.appendChild(description);

  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    close.addEventListener("click", () => {
      gsap.to(overlay, {opacity: 0, duration: 1, onComplete: () => overlay.remove()});
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

    const titre = document.createElement("h2");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if(item.images !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image}`;
        gallery.appendChild(img);
      });
      fiche.appendChild(gallery);
    }
  

    // gsap.from(fiche, {opacity: 0, duration: 0.4});
    gsap.from(overlay, {opacity: 0, duration: 0.4});
  });


});



gsap.registerPlugin(MotionPathPlugin);

const w = window.innerWidth;
const h = window.innerHeight;

    const radius = Math.min(w, h) / 3; // Réduction du rayon
    const cx = w / 2;
    const cy = h / 2;
    const d = `M ${cx} ${cy - radius} 
       a ${radius} ${radius} 0 1 1 0 ${2 * radius} 
       a ${radius} ${radius} 0 1 1 0 ${-2 * radius}`;
        

    gsap.set(".projet", {
      xPercent: -50, 
      yPercent: -50, 
      transformOrigin: "50% 50%"
     });

  let anim = gsap.to(".projet", {
    motionPath: {
      path: d,
      autoRotate: "random(-30,30,5)",
    },
    duration: 14,
    stagger: {
      each: 1,
      repeat: -1,
      ease: "linear",
    },
    ease: "linear",
   });

  // Add click event to open the image link
  document.querySelectorAll(".projet").forEach((projet, index) => {
    projet.addEventListener("click", () => {
      const sanitizedTitle = sanitizeName(json[index].titre);
      const imagePath = `img/${sanitizedTitle}.png`;
      window.open(imagePath, "_blank");
     fiche.appendChild(projet);

    });
  });
    anim.play(50);

  const damier = document.querySelector('.damier');
  const rows = 24;
  const cols = 49;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const caseDiv = document.createElement('div');
      caseDiv.classList.add('case');
      // Alterner les couleurs
      if ((i + j) % 2 === 0) {
        caseDiv.classList.add('white');
      } else {
        caseDiv.classList.add('red');
      }
      damier.appendChild(caseDiv);
    }
  }
  const image = document.querySelector('.image-suivante');

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
  
    // Centrer l'image sur la souris
    image.style.transform = `translate(${x - 0}px, ${y - 0}px)`;
  });


  const titre = document.getElementById('h2');
  const imageElement = document.getElementById('h2::after'); // Replace 'image-id' with the actual ID of the image element

  let dejaClique = false;

  titre.addEventListener('click', () => {
    if (!dejaClique && imageElement) {
      imageElement.classList.add('visible');
      dejaClique = true;
    }
  });
