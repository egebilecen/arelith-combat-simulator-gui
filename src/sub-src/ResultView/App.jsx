import { listen } from "@tauri-apps/api/event";
import { useState, useEffect } from "react";
import { Flex } from "antd";
import Loading from "../../Components/Loading";

function App() {
    const [initialData, setInitialData] = useState(null);

    const prepareGraphData = (data) => {
        let graphData = [];
        const simResults = data.map((simulation) => {
            const avgResults = Object.keys(simulation.result.statistics).map(
                (ac) => {
                    const statistics = simulation.result.statistics[ac];
                    const totalDamage = Object.keys(statistics.dmg_dealt)
                        .map((dmgType) => statistics.dmg_dealt[dmgType])
                        .reduce((a, b) => a + b, 0);
                    const avgDmg = totalDamage / simulation.result.total_rounds;

                    return {
                        ac: parseInt(ac),
                        avg_dmg: avgDmg,
                        character: simulation.character.name,
                    };
                }
            );

            return avgResults;
        });

        simResults.map((e) => {
            graphData = graphData.concat(e);
        });

        console.log(graphData);
        return graphData;
    };

    useEffect(() => {
        async function func() {
            await listen("initial_data", async (e) => {
                setInitialData(e.payload);
            });
        }

        func();
    }, []);

    return (
        <>
            {initialData === null ? (
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
            ) : (
                <>Look for a plot library.</>
            )}
        </>
    );
}

export default App;
