import { modOriginalNodes, addSidebar, addSidebarBtn } from './lib'
import './style.styl'

const writerName = document.getElementsByClassName("novel_writername").length;
const honbun = document.getElementById("novel_honbun");

if (writerName == 0 && honbun != null) {
    // wrap nodes and adjust css
    const main = document.createElement("main");
    modOriginalNodes(main);

    // add sidebar contents
    addSidebar(main);

    // add sidebar button and button func
    const sidebarButton = addSidebarBtn();
    sidebarButton.addEventListener("click", function(){
        const html = document.documentElement;
		if (html.getAttribute("aria-hidden") == "false") {
			html.setAttribute("aria-hidden", "true");
		} else {
			html.setAttribute("aria-hidden", "false");
		}
    });
}
