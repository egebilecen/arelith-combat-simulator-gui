import { useState, createContext } from "react";
import { ConfigProvider, message } from "antd";
import AppWindow from "./AppWindow";

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
    const [messageApi, contextHolder] = message.useMessage();

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
                    pageRoute: pageRoute,
                    setPageRoute: setPageRoute,
                }}
            >
                {contextHolder}
                <AppWindow themeStr={currentThemeStr} />
            </AppContext.Provider>
        </ConfigProvider>
    );
}

export default App;
