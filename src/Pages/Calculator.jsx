import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { getName } from "@tauri-apps/api/app";
import { sendNotification } from "@tauri-apps/api/notification";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
    Steps,
    Button,
    Flex,
    theme,
    Row,
    Col,
    Form,
    Result,
    Select,
    Divider,
    Typography,
    Slider,
    Checkbox,
    InputNumber,
    Progress,
    Space,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import PageContainer from "../Sections/PageContainer";
import { AppContext } from "../App";
import Loading from "../Components/Loading";

const { Text, Link } = Typography;

let unlistenSimulationUpdate;

function CalculatorPage() {
    const { showMessage } = useContext(AppContext);
    const { token } = theme.useToken();
    const { isSimulationInProgress, setIsSimulationInProgress } =
        useContext(AppContext);
    const [configForm] = Form.useForm();
    const [currentStepIndex, setCurrentContentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [isSelectingAll, setIsSelectingAll] = useState(true);
    const [characterList, setCharacterList] = useState([]);
    const [dummyAcRange, setDummyAcRange] = useState([35, 65]);
    const [simulationData, setSimulationData] = useState({});
    const [simulationLogText, setSimulationLogText] = useState(
        "Waiting for simulation to be started..."
    );
    const [simulationProgressBarStatus, setSimulationProgressBarStatus] =
        useState("normal");
    const [simulationTotalCombatCount, setSimulationTotalCombatCount] =
        useState(-1);
    const [simulationProgress, setSimulationProgress] = [
        useRef(0),
        (val) => {
            simulationProgress.current = val;
        },
    ];

    // https://blog.logrocket.com/how-when-to-force-react-component-re-render/
    const [, updateState] = useState();
    const forceRender = useCallback(() => updateState({}), []);

    const handleSelectUnselectAllCharacters = () => {
        if (isSelectingAll)
            configForm.setFieldValue(
                "characters",
                characterList.map((e) => e.id)
            );
        else configForm.setFieldValue("characters", []);

        setIsSelectingAll(!isSelectingAll);
    };

    const handleAcRangeChange = (e) => {
        setDummyAcRange(e);
    };

    const stepList = [
        {
            title: "Configuration",
            content: isLoading ? (
                <Loading loading={isLoading} style={{ marginTop: 100 }} />
            ) : isErrorOccured ? (
                <Result
                    style={{
                        display: isErrorOccured ? "block" : "none",
                    }}
                    status="warning"
                    title="An error occured"
                    subTitle={errorText}
                />
            ) : (
                <Form form={configForm} layout="vertical" requiredMark={false}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="characters"
                                label={
                                    <>
                                        <Space
                                            split={<Divider type="vertical" />}
                                            size={0}
                                        >
                                            <span>Characters</span>
                                            <Link
                                                onClick={
                                                    handleSelectUnselectAllCharacters
                                                }
                                            >
                                                {isSelectingAll ? "S" : "Uns"}
                                                elect All
                                            </Link>
                                        </Space>
                                    </>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select at least one character.",
                                    },
                                ]}
                            >
                                <Select
                                    options={characterList.map((e) => {
                                        return {
                                            label: e.name,
                                            value: e.id,
                                            title: "",
                                        };
                                    })}
                                    placeholder="Select a character or multiple characters."
                                    mode="multiple"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="simulation_rounds"
                                label="Simulation Rounds"
                                initialValue={100}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <span>
                            <b>Target Settings</b>
                        </span>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name={["dummy", "ac_range"]}
                                label={(() => {
                                    let val1 = dummyAcRange[0];
                                    let val2 = dummyAcRange[1];

                                    return (
                                        <Space
                                            split={<Divider type="vertical" />}
                                            size={0}
                                        >
                                            <span>
                                                AC
                                                {val1 !== val2
                                                    ? " Range"
                                                    : ""}:{" "}
                                                <Text strong>
                                                    {val1 +
                                                        (val2 !== val1
                                                            ? " - " + val2
                                                            : "")}
                                                </Text>
                                            </span>
                                            <Form.Item
                                                name={[
                                                    "dummy",
                                                    "has_epic_dodge",
                                                ]}
                                                valuePropName="checked"
                                                style={{ margin: 0 }}
                                                initialValue={false}
                                            >
                                                <Checkbox>
                                                    Has Epic Dodge
                                                </Checkbox>
                                            </Form.Item>
                                        </Space>
                                    );
                                })()}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select a target AC range.",
                                    },
                                ]}
                                initialValue={dummyAcRange}
                            >
                                <Slider
                                    range
                                    tooltip={{ placement: "bottom" }}
                                    step={5}
                                    min={0}
                                    max={80}
                                    dots
                                    onChange={handleAcRangeChange}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name={["dummy", "concealment"]}
                                label="Concealment"
                                initialValue={50}
                                style={{ margin: 0 }}
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={(val) => val + "%"}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["dummy", "defensive_essence"]}
                                label="Defensive Essence"
                                initialValue={5}
                                style={{ margin: 0 }}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["dummy", "damage_immunity"]}
                                label="Damage Immunity"
                                initialValue={10}
                                style={{ margin: 0 }}
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={(val) => val + "%"}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ),
        },
        {
            title: "Simulation",
            content: (
                <>
                    <Flex
                        justify="center"
                        align="center"
                        style={{
                            height: 265,
                        }}
                        vertical
                    >
                        <Progress
                            type="circle"
                            percent={
                                simulationProgress.current !==
                                simulationTotalCombatCount
                                    ? parseInt(
                                          simulationProgress.current *
                                              (100 / simulationTotalCombatCount)
                                      )
                                    : 100
                            }
                            status={simulationProgressBarStatus}
                            style={{
                                marginBottom: 6,
                            }}
                        />
                        <Text style={{ display: "block", textAlign: "center" }}>
                            {simulationLogText}
                        </Text>
                    </Flex>
                </>
            ),
        },
    ];

    const prevContent = () => {
        setCurrentContentIndex(currentStepIndex - 1);
    };

    const nextContent = async () => {
        try {
            const values = await configForm.validateFields();
            setCurrentContentIndex(currentStepIndex + 1);
            setSimulationData(values);
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
        }
    };

    const startSimulation = async () => {
        unlistenSimulationUpdate = await listen(
            "simulation_update",
            async (e) => {
                let payload = e.payload;

                switch (payload.status) {
                    case "done":
                        {
                            const characters = characterList.filter(
                                (e) => payload.details[e.id] !== undefined
                            );

                            const result = characters.map((e) => {
                                return {
                                    character: {
                                        name: e.name,
                                        id: e.id,
                                    },
                                    result: payload.details[e.id],
                                };
                            });

                            const res = await invoke("insert_row", {
                                table: "simulation_results",
                                name: "v1",
                                json: JSON.stringify({
                                    timestamp: new Date().getTime(),
                                    target_info: {
                                        concealment:
                                            simulationData.dummy.concealment,
                                        has_epic_dodge:
                                            simulationData.dummy.has_epic_dodge,
                                        damage_immunity:
                                            simulationData.dummy
                                                .damage_immunity,
                                        defensive_essence:
                                            simulationData.dummy
                                                .defensive_essence,
                                    },
                                    data: result,
                                }),
                            });

                            if (!res.success) {
                                showMessage(
                                    "error",
                                    "An error occured while saving the simulation result: " +
                                        res.msg
                                );
                            }

                            setIsSimulationInProgress(false);
                            setSimulationProgressBarStatus("success");
                            setSimulationLogText(
                                "Simulation is completed! " +
                                    (res.success
                                        ? "Results are saved."
                                        : "Couldn't save the results due to an error, though.")
                            );
                            unlistenSimulationUpdate();

                            sendNotification({
                                title: await getName(),
                                body: "Simulation is completed!",
                            });
                        }
                        break;

                    case "working":
                        {
                            setSimulationProgress(
                                simulationProgress.current + 1
                            );
                            forceRender();
                        }
                        break;

                    case "character_complete":
                        {
                        }
                        break;
                }
            }
        );

        setSimulationProgress(0);
        setIsSimulationInProgress(true);
        setSimulationProgressBarStatus("normal");
        setSimulationLogText("Simulation is started...");

        const dummyAcRange = [];

        for (
            let i = simulationData.dummy.ac_range[0];
            i <= simulationData.dummy.ac_range[1];
            i += 5
        ) {
            dummyAcRange.push(i);
        }

        const characters = {};
        characterList
            .filter((e) => simulationData.characters.indexOf(e.id) !== -1)
            .map((e) => {
                characters[e.id] = e.obj;
            });

        setSimulationTotalCombatCount(
            dummyAcRange.length * Object.keys(characters).length
        );

        try {
            await invoke("start_simulation", {
                app: appWindow,
                totalRounds: simulationData.simulation_rounds,
                characters: characters,
                dummyAcList: dummyAcRange,
                dummyConcealment: simulationData.dummy.concealment,
                dummyHasEpicDodge: simulationData.dummy.has_epic_dodge,
                dummyDamageImmunity: simulationData.dummy.damage_immunity,
                dummyDefensiveEssence: simulationData.dummy.defensive_essence,
            });
        } catch (errorInfo) {
            setIsSimulationInProgress(false);
            setSimulationProgressBarStatus("exception");
            setSimulationLogText(
                <span>
                    <Text strong>Error: </Text> {errorInfo}
                </span>
            );
            console.error("Couldn't start simulation: ", errorInfo);
        }
    };

    // Load stuff
    useEffect(() => {
        async function func() {
            const [characters] = await Promise.all([
                invoke("get_rows", { table: "characters" }),
            ]);

            setIsLoading(false);

            if (!characters.success) {
                setErrorText(characters.msg);
                setIsErrorOccured(true);
                return;
            }

            setCharacterList(
                characters.result.map((e) => {
                    const temp = e;
                    temp.obj = JSON.parse(e.json);

                    return temp;
                })
            );
        }

        func();
    }, []);

    return (
        <PageContainer>
            <Steps
                current={currentStepIndex}
                items={stepList.map((item, i) => {
                    const obj = {
                        key: item.title,
                        title: item.title,
                    };

                    if (isSimulationInProgress && i == stepList.length - 1)
                        obj.icon = <LoadingOutlined />;

                    return obj;
                })}
                style={{
                    marginBottom: 16,
                }}
            />
            <div
                style={{
                    minHeight: 292,
                    background: token.colorBgLayout,
                    border: "1px solid " + token.colorBorderSecondary,
                    padding: 12,
                    borderRadius: 6,
                    overflowX: "hidden",
                    overflowY: "auto",
                }}
            >
                {stepList[currentStepIndex].content}
            </div>
            <Flex gap="small" style={{ position: "relative", marginTop: 16 }}>
                <Button
                    onClick={prevContent}
                    style={{ width: 82 }}
                    disabled={
                        isLoading ||
                        isErrorOccured ||
                        isSimulationInProgress ||
                        currentStepIndex < 1
                    }
                >
                    Previous
                </Button>
                <Button
                    onClick={
                        currentStepIndex == stepList.length - 1
                            ? startSimulation
                            : nextContent
                    }
                    style={{
                        position: "absolute",
                        width: 82,
                        right: 0,
                    }}
                    type="primary"
                    disabled={
                        isLoading || isErrorOccured || isSimulationInProgress
                    }
                >
                    {currentStepIndex == stepList.length - 1
                        ? "Simulate"
                        : "Next"}
                </Button>
            </Flex>
        </PageContainer>
    );
}

export default CalculatorPage;
