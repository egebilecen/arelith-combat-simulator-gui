import { WebviewWindow } from "@tauri-apps/api/window";

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
    const webview = new WebviewWindow(label, window);

    webview.once("tauri://created", function () {
        if (data !== undefined) {
            setTimeout(() => webview.emit("initial_data", data), 1000);
        }

        console.log(
            'New webview window with label "' + label + '" is created.'
        );
    });

    webview.once("tauri://error", function (err) {
        console.error(
            'An error occured while creating new webview window with label "' +
                label +
                '": ',
            err
        );
    });

    return webview;
};
