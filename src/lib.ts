function querySelector(selectors: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selectors);
    if (element == null) {
        throw new Error("Failed to get HTMLElement.");
    }
    return element;
}

function getElementsByClassName(className: string): HTMLCollectionOf<Element> {
    const element = document.getElementsByClassName(className);
    if (element == null) {
        throw new Error("Failed to get HTMLCollection.");
    }
    return element;
}

function getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (element == null) {
        throw new Error("Failed to get HTMLElement.");
    }
    return element;
}

let url: string;
let link: string;
let ncode: string;

let documentDL: Document;

function getHTML(url: string) {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.onload = function () {
            const parser = new DOMParser();
            documentDL = parser.parseFromString(xhr.responseText, "text/html");
        }
        xhr.send(null);
    }
    catch (e) {
        throw new Error("Failed to get Document.");
    }
}

let type: string;

function getTypeNode() {
    const noveltype = documentDL.getElementById("noveltype");
    const noveltype_notend = documentDL.getElementById("noveltype_notend");
    if (noveltype == null && noveltype_notend != null) {
        type = `長編 ${noveltype_notend.textContent}`
    } else if (noveltype != null && noveltype_notend == null) {
        const text = noveltype.textContent;
        if (text != "短編") {
            type = `長編 ${text}`
        } else {
            type = text;
        }
    }
}

async function getType() {
    const url = `${link}novelview/infotop/ncode/${ncode}/`;
    getHTML(url);
    await getTypeNode();
}

let ctIndex: number[] = new Array(0);
let elementCT: HTMLCollectionOf<Element>;
let elementSt: HTMLCollectionOf<Element>;

function getIndexNodes() {
    const indexBox = documentDL.getElementsByClassName("index_box")[0].children;
    const nodes = Array.prototype.slice.call(indexBox);
    elementCT = documentDL.getElementsByClassName("chapter_title");
    const len = elementCT.length;
    if (len > 0) {
        for (let i = 0; i < len; i++) {
            ctIndex.push(nodes.indexOf(elementCT[i])-1*i);
        }
    }
}

function getSubtitleNodes() {
    getHTML(url);
    getIndexNodes();
    elementSt = documentDL.getElementsByClassName("subtitle");
}

async function getSubtitle() {
    await getSubtitleNodes();
}

function modOriginalNodes(main: HTMLElement) {
    const nodes = Array.prototype.slice.call(querySelector("body").childNodes).slice(0, 15);

    const pageBottom = getElementById("pageBottom");
    pageBottom.parentNode?.insertBefore(main, pageBottom);

    for(let node of nodes) {
        main.appendChild(node);
    }

    // adjust css
    const btnRight = 85;
    getElementById("menu_on").style.right = `${btnRight}px`;
    getElementById("menu_off").style.right = `${btnRight}px`;
}

function addSidebarHead(div: HTMLElement) {
    const header = document.createElement("header");
    header.style.padding = "0 15px";

    // add novel title
    const h3 = document.createElement("h3");
    h3.style.marginBottom = "10px";
    header.appendChild(h3);

    const h3A = document.createElement("a");
    h3A.setAttribute("href", url);
    h3A.textContent = document.title.split(" - ")[0];
    h3.appendChild(h3A);

    // add novel author
    const span = document.createElement("span");
    span.textContent = "作者：";

    const authorName = getElementsByClassName("contents1")[0].textContent?.split("\n")[2].slice(3);
    if (authorName != null) {
        const spanA = document.createElement("a");

        const authorLink = getElementsByClassName("undernavi")[0].getElementsByTagName("a")[0].href;
        spanA.setAttribute("href", authorLink);
        spanA.textContent = authorName;
        span.appendChild(spanA);
    }

    header.appendChild(span);
    div.appendChild(header);
}

function addSidebarMain(div: HTMLElement) {
    const main = Object.assign(document.createElement("div"), {id:"main"});
    main.style.marginTop = "30px";

    // add header
    const header = document.createElement("header");
    header.style.padding = "0 15px 10px 15px";
    header.style.borderBottom = "1px solid #ccc";
    main.appendChild(header);

    const h4 = document.createElement("h4");
    h4.textContent = "目次";
    header.appendChild(h4);
    
    const span = document.createElement("span");
    span.style.color = "#666";
    span.style.fontSize = "0.85em";

    const chapterElement = getElementById("novel_no");
    const chapter = chapterElement.textContent?.split("/") as unknown as number[];
    const readNow = chapter[0];
    const total = chapter[1];
    getType();
    span.textContent = `${type}　全${total}部分`;
    header.appendChild(span);

    // add chapter list
    const chapterList = Object.assign(document.createElement("section"), {id:"chapter-list"});

    // add list
    const ol = document.createElement("ol");
    ol.style.listStyle = "none";

    getSubtitle();

    let n = 0;
    for (let i = 0; i < total;) {
        const chapter = i+1;
        const li = document.createElement("li");
        if (ctIndex.length != 0 && ctIndex[n] == i) {
            const chapterTitle = elementCT[n].textContent?.replace("\n", "");
            li.textContent = `${chapterTitle}`;
            if (n != 0) {
                li.style.marginTop = "16px";
            }
            li.style.padding = "20px 16px 5px 16px";
            li.style.color = "#666";
            li.style.backgroundColor = "#e4e4e4";
            li.style.textAlign = "center";
            n++;
        } else {
            li.style.marginLeft = "16px";
            li.style.borderBottom = "1px solid #ccc";
        
            const a = document.createElement("a");
            a.setAttribute("href", `${url}${chapter}/`);
            a.style.display = "block";
            if (chapter==readNow) {
                li.style.listStyle = "disclosure-closed";
                li.style.marginLeft = "28px";
                a.style.padding = "12px 14px 12px 5px";
            } else {
                a.style.padding = "12px 16px 12px 0";
            }
            const subtitle = elementSt[i].textContent?.replace("\n", "");
            a.textContent = `${subtitle}`;
            li.appendChild(a);
            i++;
        }
        ol.appendChild(li);
    }
    chapterList.appendChild(ol);
    main.appendChild(chapterList);
    div.appendChild(main);
}

function addSidebar(main: HTMLElement) {
    let aside = Object.assign(document.createElement("aside"), {id:"sidebar"});
    aside.style.backgroundColor = "#eee";
    main.after(aside);

    const div = document.createElement("div");
    div.style.borderLeft = "1px solid #ccc";
    div.style.padding = "25px 0";

    const URL = document.URL.split("/") as string[];
    link = `https://${URL[2]}/`;
    ncode = URL[3];
    url = `${link}${ncode}/`

    // add sidebar header
    addSidebarHead(div);

    // add sidebar main
    addSidebarMain(div);

    aside.appendChild(div);
}

function addSidebarBtn(): HTMLElement {
    // create button
    const sidebarButton = Object.assign(document.createElement("div"), {id:"sidebar-btn"});
    sidebarButton.textContent = "目次";
    sidebarButton.style.backgroundColor = "#fff";
    sidebarButton.style.color = "#666";
    sidebarButton.style.border = "1px solid #bbb";
    sidebarButton.style.borderBottomColor = "#999";

    const navButton = getElementById("novelnavi_right");
    navButton.appendChild(sidebarButton);
    return sidebarButton
}

export { modOriginalNodes, addSidebar, addSidebarBtn }
