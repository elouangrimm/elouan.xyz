const getCurrentFeed = async () => {
    const response = await fetch("/feed.xml");
    const feed = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(feed, "application/xml");
    return document;
};

const parseItems = (document) => {
    const items = document.querySelectorAll("item");
    const parsedItems = Array.from(items).map((item) => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        const description = item.querySelector("description").textContent;
        const pubDate = item.querySelector("pubDate").textContent;
        return { title, link, description, pubDate };
    });
    return parsedItems;
};

let currentItems = [];

function getLocalFeed() {
    const feed = localStorage.getItem("feed");
    if (feed) return JSON.parse(feed);
}

function setLocalFeed(feed) {
    localStorage.setItem("feed", JSON.stringify(feed));
}

const main = async () => {
    const localFeed = getLocalFeed();
    if (localFeed) {
        renderItems(localFeed);
        currentItems = localFeed;
        updateSearch(document.querySelector("#search").value);
    }
    const currentFeed = await getCurrentFeed();
    currentItems = parseItems(currentFeed);
    const sorted = currentItems.sort((a, b) => {
        const aDate = new Date(a.pubDate);
        const bDate = new Date(b.pubDate);
        return bDate - aDate;
    });
    renderItems(sorted);
    setLocalFeed(sorted);

    updateSearch(document.querySelector("#search").value);
};

const renderItems = (items) => {
    const itemsDiv = document.getElementById("items");
    itemsDiv.innerHTML = "";

    items.forEach((item, i) => {
        const itemSection = document
            .getElementById("item-template")
            .content.firstElementChild.cloneNode(true);

        const title = itemSection.querySelector(".title");
        title.textContent = item.title;

        const description = itemSection.querySelector(".description");
        description.textContent = item.description;

        const link = itemSection.querySelector(".link");
        link.textContent = item.link;
        link.href = item.link;

        const pubDate = itemSection.querySelector(".pub-date");
        const date = new Date(item.pubDate);
        pubDate.textContent = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        itemsDiv.appendChild(itemSection);
    });
};

const search = document.querySelector("#search");

function updateSearch(searchTerm) {
    // console.log(searchTerm);
    if (!searchTerm) {
        renderItems(currentItems);
        return;
    }
    const exactTerms = searchTerm
        .split('"')
        .filter((term, i) => i % 2 === 1)
        .filter((term) => term !== "");

    const searchTerms = searchTerm.split(" ").filter((term) => term !== "");
    const items = currentItems;
    const scores = items.map((item) => {
        let score = 0;
        const fullSearchTerm = searchTerm;

        if (
            item.title.toLowerCase() === fullSearchTerm ||
            item.link.toLowerCase() === fullSearchTerm ||
            item.description.toLowerCase() === fullSearchTerm
        ) {
            score += 10000;
        }

        if (
            item.title.toLowerCase().includes(fullSearchTerm) ||
            item.description.toLowerCase().includes(fullSearchTerm) ||
            item.link.toLowerCase().includes(fullSearchTerm)
        ) {
            score += 1000;
        }

        searchTerms.forEach((term) => {
            if (item.title.toLowerCase().includes(term)) {
                score += 100;
            }

            if (item.description.toLowerCase().includes(term)) {
                score += 10;
            }

            if (item.link.toLowerCase().includes(term)) {
                score += 1;
            }
        });

        exactTerms.forEach((term) => {
            if (item.title.toLowerCase().includes(term)) {
                score += 100;
            }

            if (item.description.toLowerCase().includes(term)) {
                score += 1;
            }

            if (item.link.toLowerCase().includes(term)) {
                score += 1;
            }
        });
        return score;
    });

    const sortedItems = items
        .map((item, i) => ({ item, score: scores[i] }))
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (a.score === b.score) {
                return new Date(b.pubDate) - new Date(a.pubDate);
            }
            return b.score - a.score;
        })
        .map((item) => item.item);

    renderItems(sortedItems);
}

function updateShareSearchParams() {
    const searchTerm = search.value;
    if (searchTerm === "") {
        const activeElement = document.activeElement;
        if (activeElement === search) {
            window.history.replaceState({}, "RSS feed", "/feed/?search");
        } else {
            window.history.replaceState({}, "RSS feed", "/feed/");
        }
    } else {
        window.history.replaceState(
            {},
            "RSS feed",
            `/feed/?search=${searchTerm}`
        );
    }
}

search.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    updateSearch(searchTerm);
    updateShareSearchParams();
});

search.addEventListener("focus", (e) => {
    updateShareSearchParams();
});

search.addEventListener("blur", (e) => {
    updateShareSearchParams();
});

main();

const _search = document.querySelector("#search");

const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.has("search");
if (searchParam) {
    const value = urlParams.get("search");
    if (value) {
        _search.value = value;
    } else {
        _search.focus();
    }
}

addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        _search.focus();
        _search.select();
    }
});
