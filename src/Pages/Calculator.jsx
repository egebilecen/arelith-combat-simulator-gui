import { useState, useEffect } from "react";
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
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { invoke } from "@tauri-apps/api";
import PageContainer from "../Sections/PageContainer";

const { Text } = Typography;

function CalculatorPage() {
    const { token } = theme.useToken();
    const [configForm] = Form.useForm();
    const [currentStepIndex, setCurrentContentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [isSelectingAll, setIsSelectingAll] = useState(true);
    const [characterList, setCharacterList] = useState([]);
    const [dummyAcRange, setDummyAcRange] = useState([35, 65]);

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
                        <Col span={24}>
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
            content: "Last-content",
        },
    ];

    const prevContent = () => {
        setCurrentContentIndex(currentStepIndex - 1);
    };

    const nextContent = async () => {
        try {
            const values = await configForm.validateFields();
            setCurrentContentIndex(currentStepIndex + 1);

            console.log(values);
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
        }
    };

    const startSimulation = () => {
        console.log("Starting...");
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

            setCharacterList(characters.result);
        }

        func();
    }, []);

    return (
        <PageContainer>
            <Steps
                current={currentStepIndex}
                items={stepList.map((item) => ({
                    key: item.title,
                    title: item.title,
                }))}
                style={{
                    marginBottom: 16,
                }}
            />
            <div
                style={{
                    minHeight: 294,
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
                        isLoading || isErrorOccured || currentStepIndex < 1
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
                    style={{ position: "absolute", width: 82, right: 0 }}
                    type="primary"
                    disabled={isLoading || isErrorOccured}
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
