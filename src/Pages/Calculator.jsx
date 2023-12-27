import { appWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
    Steps,
    Button,
    Flex,
    theme,
    Row,
    Col,
    Form,
    Spin,
    Result,
    Select,
    Divider,
    Typography,
    Slider,
    Checkbox,
    InputNumber,
    Progress,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { invoke } from "@tauri-apps/api";
import PageContainer from "../Sections/PageContainer";
import { AppContext } from "../App";

const { Text } = Typography;

let unlistenSimulationUpdate;

function CalculatorPage() {
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
        "Waiting for simulation to start..."
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
                <Spin
                    indicator={<LoadingOutlined />}
                    tip="Loading..."
                    spinning={isLoading}
                    style={{
                        marginTop: 100,
                    }}
                >
                    <p
                        style={{
                            display: isLoading === true ? "block" : "none",
                        }}
                    >
                        &nbsp;
                    </p>
                </Spin>
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
                                        <span>Characters</span>
                                        <Divider type="vertical" />
                                        <Typography.Link
                                            onClick={
                                                handleSelectUnselectAllCharacters
                                            }
                                        >
                                            {isSelectingAll ? "S" : "Uns"}elect
                                            All
                                        </Typography.Link>
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
                                        <>
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
                                            <Divider type="vertical" />
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
                                        </>
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

        const characters = characterList
            .filter((e) => simulationData.characters.indexOf(e.id) !== -1)
            .map((e) => e.obj);

        setSimulationTotalCombatCount(dummyAcRange.length * characters.length);

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
            unlistenSimulationUpdate = await listen(
                "simulation_update",
                (e) => {
                    let payload = e.payload;
                    console.log(payload);

                    switch (payload.status) {
                        case "done":
                            {
                                setIsSimulationInProgress(false);
                                setSimulationProgressBarStatus("success");
                                setSimulationLogText(
                                    "Simulation is completed!"
                                );
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

                    if (payload.status == "done") {
                    }
                }
            );

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
