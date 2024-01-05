import { WebviewWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

const intervalList = {};
let listener = null;

export const windows = {
    result_viewer: {
        title: "Result Viewer",
        url: "../result-view.html",
        width: 600,
        height: 600,
        resizable: true,
        center: true,
    },
};

export const createWindow = (label, window, data) => {
    const slugify = (str) => {
        return str
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "")
            .replaceAll("-", "_");
    };

    if (intervalList[window.name] === undefined) intervalList[window.name] = {};

    const intervals = intervalList[window.name];
    clearInterval(intervals[label]);

    const webviewLabel = slugify(window.title) + label;
    const webview = new WebviewWindow(webviewLabel, window);

    webview.once("tauri://created", async function () {
        if (data !== undefined) {
            if (listener === null) {
                listener = await listen("results_loaded", (e) => {
                    clearInterval(intervals[e.payload.id]);
                });
            }

            intervals[label] = setInterval(
                () =>
                    webview.emit("initial_data", {
                        id: label,
                        ...data,
                    }),
                500
            );
        }

        console.log(
            'New webview window with label "' + webviewLabel + '" is created.'
        );
    });

    webview.once("tauri://error", async function (err) {
        console.error(
            'An error occured while creating new webview window with label "' +
                webviewLabel +
                '": ',
            err
        );
    });

    return webview;
};
