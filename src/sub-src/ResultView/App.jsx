import { listen } from "@tauri-apps/api/event";
import { useState, useEffect } from "react";
import { Flex } from "antd";
import Loading from "../../Components/Loading";

function App() {
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        async function func() {
            await listen("initial_data", async (e) => {
                setInitialData(e.payload);
                console.log(e);
            });
        }

        func();
    }, []);

    return (
        <>
            {initialData === null && (
                <Flex
                    align="center"
                    justify="center"
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <Loading loading={true} size="large" />
                </Flex>
            )}
        </>
    );
}

export default App;
