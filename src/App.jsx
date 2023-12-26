import { useState } from "react";
import { ConfigProvider } from "antd";
import AppWindow from "./AppWindow";

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
    const [currentThemeStr, setCurrentThemeStr] = useState("light");

    return (
        <ConfigProvider
            theme={currentThemeStr === "light" ? lightTheme : darkTheme}
        >
            <AppWindow themeStr={currentThemeStr} />
        </ConfigProvider>
    );
}

export default App;
