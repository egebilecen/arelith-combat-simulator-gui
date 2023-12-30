import { listen } from "@tauri-apps/api/event";
import { useState, useEffect } from "react";
import { Flex } from "antd";
import ReactECharts from "echarts-for-react";
import Loading from "../../Components/Loading";

function App() {
    const [initialData, setInitialData] = useState(null);
    const [graphData, setGraphData] = useState([]);

    const prepareGraphData = (data) => {
        const graphData = data.map((simulation) => {
            const characterData = {
                label: simulation.character.name,
                xAxis: [],
                yAxis: [],
            };

            Object.keys(simulation.result.statistics).map((ac) => {
                const statistics = simulation.result.statistics[ac];
                const totalDamage = Object.keys(statistics.dmg_dealt)
                    .map((dmgType) => statistics.dmg_dealt[dmgType])
                    .reduce((a, b) => a + b, 0);
                const avgDmg = totalDamage / simulation.result.total_rounds;

                characterData.xAxis.push(parseInt(ac));
                characterData.yAxis.push(avgDmg);
            });

            return characterData;
        });

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

    useEffect(() => {
        if (initialData !== null && initialData.data !== undefined)
            setGraphData(prepareGraphData(initialData.data));
    }, [initialData]);

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
                (() => {
                    return (
                        <ReactECharts
                            style={{
                                width: "100%",
                                height: "100%",
                                paddingTop: 6,
                            }}
                            option={{
                                title: {
                                    text:
                                        "Simulation of " +
                                        (initialData
                                            ? initialData.data[0].result
                                                  .total_rounds
                                            : "X") +
                                        " Rounds",
                                    left: "center",
                                    top: 0,
                                },
                                tooltip: {
                                    trigger: "axis",
                                    axisPointer: {
                                        type: "line",
                                    },
                                    formatter: (params) => {
                                        const sortedParams = params.sort(
                                            (a, b) => b.data - a.data
                                        );

                                        const tooltipHtml = `
                                            <div style='margin: 0px 0 0;line-height:1;'>
                                                <div style='margin: 0px 0 0;line-height:1;'>
                                                    <div style='font-size:14px;color:#666;line-height:1;'>
                                                        <b>Target AC: </b> ${sortedParams[0].axisValue}
                                                    </div>
                                                    {labels}

                                                    <div style='clear:both'></div>
                                                </div>

                                                <div style='clear:both'></div>
                                            </div>
                                        `;

                                        return tooltipHtml.replace(
                                            "{labels}",
                                            sortedParams
                                                .map((e) => {
                                                    return `
                                            <div style='margin: 6px 0 0;line-height:1;'>
                                                <div style='margin: 0px 0 0;line-height:1;'>
                                                    <div style='margin: 0px 0 0;line-height:1;'>
                                                        ${e.marker}
                                                        <span style='font-size:14px;color:#666;font-weight:400;'>${e.seriesName}</span>
                                                        <span style='float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900'>${e.value}</span>
                                                        <div style='clear:both'></div>
                                                    </div>

                                                    <div style='clear:both'></div>
                                                </div>
                                            </div>
                                        `;
                                                })
                                                .join("")
                                        );
                                    },
                                },
                                legend: {
                                    data: graphData.map((e) => e.label),
                                    orient: "horizontal",
                                    left: "center",
                                    top: 25,
                                },
                                grid: {
                                    left: "4%",
                                    right: "4%",
                                    bottom: "3%",
                                    top: 85,
                                    containLabel: true,
                                },
                                toolbox: {
                                    showTitle: false,
                                    feature: {
                                        saveAsImage: {
                                            name: "result",
                                            pixelRatio: 4,
                                        },
                                    },
                                    top: 0,
                                    right: 16,
                                },
                                xAxis: {
                                    name: "Target AC",
                                    nameLocation: "middle",
                                    nameTextStyle: {
                                        lineHeight: 24,
                                    },
                                    type: "category",
                                    boundaryGap: false,
                                    data:
                                        graphData.length > 0
                                            ? graphData[0].xAxis
                                            : [],
                                    splitLine: {
                                        show: true,
                                    },
                                },
                                yAxis: {
                                    name: "Average Damage",
                                    nameLocation: "middle",
                                    nameTextStyle: {
                                        lineHeight: 48,
                                    },
                                    type: "value",
                                    min: 0,
                                    splitLine: {
                                        show: true,
                                    },
                                },
                                series: graphData.map((e) => {
                                    return {
                                        name: e.label,
                                        data: e.yAxis,
                                        type: "line",
                                        symbol: "circle",
                                        symbolSize: 8,
                                        lineStyle: {
                                            width: 3,
                                        },
                                        // cursor: "default",
                                    };
                                }),
                                animationDuration: 500,
                            }}
                        />
                    );
                })()
            )}
        </>
    );
}

export default App;
