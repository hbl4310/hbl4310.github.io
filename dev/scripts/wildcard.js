const cardsPath = "/frames";
const cards = ["shapes", "icosahedron"];
const numCards = cards.length;
let cardIndex = 0;

const frameIds = ["main-box-iframe"];

function switchFrames() {
    // TODO randomise frames on start up 
    cardIndex = (cardIndex + 1) % numCards;
    const cardName = cards[cardIndex];
    const cardPath = `${cardsPath}/${cardName}.html`;
    const cardTitle = `${cardName.charAt(0).toUpperCase()}${cardName.slice(1)}`
    for (const frameId of frameIds) {
        const iframe = document.getElementById(frameId);
        iframe.src = cardPath;
        iframe.title = `Main Card: ${cardTitle}`;
        iframe.name = `main-iframe-${Date.now()}`;  // prevent caching the iframe?
        postTheme(iframe);
    }
}
