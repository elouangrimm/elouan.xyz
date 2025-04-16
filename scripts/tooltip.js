document.addEventListener("DOMContentLoaded", () => {
    const tooltipDisplay = document.getElementById("tooltip-display");
    const tooltipTargets = document.querySelectorAll(".has-tooltip");

    if (!tooltipDisplay) {
        console.warn("Tooltip display element (#tooltip-display) not found.");
        return;
    }

    tooltipTargets.forEach((target) => {
        let tooltipText = target.dataset.tooltip || "";

        if (!tooltipText) return;

        target.addEventListener("mouseenter", (event) => {
            tooltipDisplay.textContent = tooltipText;

            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltipDisplay.getBoundingClientRect();

            let top =
                targetRect.top +
                window.scrollY -
                tooltipDisplay.offsetHeight -
                8;
            let left =
                targetRect.left +
                window.scrollX +
                targetRect.width / 2 -
                tooltipDisplay.offsetWidth / 2;

            const screenPadding = 10;
            if (left < screenPadding) {
                left = screenPadding;
            } else if (
                left + tooltipDisplay.offsetWidth >
                window.innerWidth - screenPadding
            ) {
                left =
                    window.innerWidth -
                    tooltipDisplay.offsetWidth -
                    screenPadding;
            }

            if (top < window.scrollY + screenPadding) {
                top = targetRect.bottom + window.scrollY + 8;
            }

            tooltipDisplay.style.top = `${top}px`;
            tooltipDisplay.style.left = `${left}px`;

            tooltipDisplay.classList.add("visible");
        });

        target.addEventListener("mouseleave", () => {
            tooltipDisplay.classList.remove("visible");
        });

        target.setAttribute("tabindex", "0");

        target.addEventListener("focus", (event) => {
            target.dispatchEvent(new MouseEvent("mouseenter"));
        });

        target.addEventListener("blur", () => {
            target.dispatchEvent(new MouseEvent("mouseleave"));
        });
    });
});
