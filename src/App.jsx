import { useState, createContext } from "react";
import { ConfigProvider, message, notification } from "antd";
import AppWindow from "./AppWindow";
import "@fontsource/noto-sans";
import "./common.css";
import "./app.css";

export const AppContext = createContext(null);

const lightTheme = {
    token: {},
    components: {
        Header: {
            custom: {
                backgroundColor: "#fff",
            },
        },
    },
};

const darkTheme = {
    token: {},
    components: {
        Header: {
            custom: {
                backgroundColor: "inherit",
            },
        },
    },
};

function App() {
    const [pageRoute, setPageRoute] = useState(["home"]);
    const [isSimulationInProgress, setIsSimulationInProgress] = useState(false);
    const [currentThemeStr, setCurrentThemeStr] = useState("light");
    const [messageApi, messageContextHolder] = message.useMessage();
    const [notificationApi, notificationContextHolder] =
        notification.useNotification();

    const showMessage = (type, text) => {
        messageApi.open({
            type: type,
            content: text,
            style: {
                marginTop: 64,
                marginLeft: 172,
            },
            duration: 2,
        });
    };

    return (
        <ConfigProvider
            theme={currentThemeStr === "light" ? lightTheme : darkTheme}
        >
            <AppContext.Provider
                value={{
                    isSimulationInProgress: isSimulationInProgress,
                    setIsSimulationInProgress: setIsSimulationInProgress,
                    showMessage: showMessage,
                    notificationApi: notificationApi,
                    pageRoute: pageRoute,
                    setPageRoute: setPageRoute,
                }}
            >
                {messageContextHolder}
                {notificationContextHolder}
                <AppWindow themeStr={currentThemeStr} />
            </AppContext.Provider>
        </ConfigProvider>
    );
}

export default App;
