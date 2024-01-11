import { useContext, useEffect, useState } from "react";
import {
    Button,
    Flex,
    Result,
    List,
    Row,
    Col,
    Form,
    Space,
    Input,
    Select,
    Tooltip,
    InputNumber,
    Typography,
    Divider,
    Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";
import { AppContext } from "../App";
import Loading from "../Components/Loading";
import HelpText from "../Components/HelpText";

const { Text, Link } = Typography;

function BaseWaponListPage() {
    const { showMessage } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [baseWeaponList, setBaseWeaponList] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form] = Form.useForm();
    const [isCreating, setIsCreating] = useState(false);

    const handleNewBtnClick = () => {
        setIsFormOpen(true);
    };

    const handleDeleteAllBtnClick = async () => {
        const res = await invoke("delete_all_rows", {
            table: "base_weapons",
        });

        if (res.success) {
            showMessage(
                "success",
                "All base weapons are successfully deleted."
            );
            setBaseWeaponList([]);
        } else {
            showMessage(
                "error",
                "An error occured while deleting all base weapons: " + res.msg
            );
        }
    };

    const handleDeleteLinkClick = async (id) => {
        const res = await invoke("delete_row", {
            table: "base_weapons",
            id: id,
        });

        if (res.success) {
            showMessage("success", "The base weapon is successfully deleted.");
            setBaseWeaponList(baseWeaponList.filter((e, i) => e.id !== id));
        } else {
            showMessage(
                "error",
                "An error occured while deleting the base weapon: " + res.msg
            );
        }
    };

    const handleFormCancelBtnClick = () => {
        form.resetFields();
        setIsFormOpen(false);
    };

    const handleFormCreateBtnClick = async () => {
        setIsCreating(true);

        try {
            const values = await form.validateFields();

            const baseItem = await invoke("create_base_weapon", {
                name: values.name,
                size: values.size,
                damage: values.damage,
                threatRange: values.threat_range,
                critMult: values.crit_mult,
                damageType: values.damage_type,
            });

            const baseItemJson = JSON.stringify(baseItem);

            const res = await invoke("insert_row", {
                table: "base_weapons",
                name: values.name,
                json: baseItemJson,
            });

            if (res.success) {
                showMessage(
                    "success",
                    "The base weapon is successfully created."
                );
            } else {
                showMessage(
                    "error",
                    "An error occured while creating the base weapon: " +
                        res.msg
                );
                setIsCreating(false);
                return;
            }

            setBaseWeaponList([
                ...baseWeaponList,
                {
                    id: res.result,
                    name: values.name,
                    json: baseItemJson,
                },
            ]);

            setIsCreating(false);
            handleFormCancelBtnClick();
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
            setIsCreating(false);
        }
    };

    // Load characters
    useEffect(() => {
        async function func() {
            const [rows] = await Promise.all([
                invoke("get_rows", { table: "base_weapons" }),
            ]);

            setIsLoading(false);

            if (!rows.success) {
                setErrorText(rows.msg);
                setIsErrorOccured(true);
                return;
            }

            setBaseWeaponList(rows.result);
        }

        func();
    }, []);

    return (
        <>
            <PageContainer>
                {!isLoading && !isErrorOccured && (
                    <Flex justify="end" gap="small">
                        {baseWeaponList.length > 1 && (
                            <Popconfirm
                                title="Warning"
                                description="Are you sure to delete all base weapons?"
                                onConfirm={handleDeleteAllBtnClick}
                                okText="Yes"
                                cancelText="No"
                                placement="bottom"
                            >
                                <Button
                                    type="primary"
                                    icon={<DeleteOutlined />}
                                    danger
                                >
                                    Delete All
                                </Button>
                            </Popconfirm>
                        )}

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNewBtnClick}
                        >
                            New
                        </Button>
                    </Flex>
                )}

                <Loading loading={isLoading} />

                {isErrorOccured && (
                    <Result
                        status="warning"
                        title="An error occured"
                        subTitle={errorText}
                    />
                )}

                {!isLoading && !isErrorOccured && (
                    <List
                        itemLayout="horizontal"
                        dataSource={baseWeaponList}
                        renderItem={(item) => {
                            item.obj = JSON.parse(item.json);

                            const threatRange = item.obj.threat_range;

                            const critMultiplier = item.obj.crit_multiplier;

                            const actions = [
                                <Popconfirm
                                    title="Warning"
                                    description="Are you sure to delete this base weapon?"
                                    onConfirm={() =>
                                        handleDeleteLinkClick(item.id)
                                    }
                                    okText="Yes"
                                    cancelText="No"
                                    placement="left"
                                >
                                    <Link type="danger">delete</Link>
                                </Popconfirm>,
                            ];

                            return (
                                <List.Item actions={actions}>
                                    <List.Item.Meta
                                        title={item.name}
                                        description={
                                            <Row gutter={16}>
                                                <Col span={4}>
                                                    <Text strong underline>
                                                        Size
                                                    </Text>
                                                    <br />
                                                    <Text>{item.obj.size}</Text>
                                                </Col>
                                                <Col span={6}>
                                                    <Text strong underline>
                                                        Threat Range
                                                    </Text>
                                                    <br />
                                                    <Text>
                                                        {threatRange == 20
                                                            ? threatRange
                                                            : threatRange +
                                                              " - " +
                                                              "20"}
                                                    </Text>
                                                </Col>
                                                <Col span={6}>
                                                    <Text strong underline>
                                                        Crit. Multiplier
                                                    </Text>
                                                    <br />
                                                    <Text>
                                                        x{critMultiplier}
                                                    </Text>
                                                </Col>
                                                <Col span={6}>
                                                    <Text strong underline>
                                                        Damage Type
                                                    </Text>
                                                    <br />
                                                    <HelpText
                                                        items={
                                                            item.obj.damage_type
                                                        }
                                                    >
                                                        {
                                                            item.obj.damage_type
                                                                .length
                                                        }
                                                    </HelpText>
                                                </Col>
                                            </Row>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}

                <Drawer
                    title="Create a new base weapon"
                    open={isFormOpen}
                    closable={false}
                    extra={
                        <Space>
                            <Button onClick={handleFormCancelBtnClick}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleFormCreateBtnClick}
                                loading={isCreating}
                            >
                                Create
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                        requiredMark={false}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label="Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a name.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Scimitar" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="size"
                                    label="Size"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a size.",
                                        },
                                    ]}
                                    initialValue={"Medium"}
                                >
                                    <Select
                                        placeholder="Select a size"
                                        options={[
                                            {
                                                label: "Tiny",
                                                value: "Tiny",
                                                title: "",
                                            },
                                            {
                                                label: "Small",
                                                value: "Small",
                                                title: "",
                                            },
                                            {
                                                label: "Medium",
                                                value: "Medium",
                                                title: "",
                                            },
                                            {
                                                label: "Large",
                                                value: "Large",
                                                title: "",
                                            },
                                            {
                                                label: "Huge",
                                                value: "Huge",
                                                title: "",
                                            },
                                        ]}
                                        title=""
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Tooltip
                                    placement="bottomLeft"
                                    title="Either a number such as 4 or a dice such as 1d6."
                                >
                                    <Form.Item
                                        name="damage"
                                        rules={[
                                            {
                                                required: true,
                                                pattern: new RegExp(
                                                    /^((?:[1-9][0-9]*)|(?:[1-9][0-9]*d[1-9][0-9]*))$/g
                                                ),
                                                message:
                                                    "Please enter a valid value.",
                                            },
                                        ]}
                                        label="Damage"
                                    >
                                        <Input placeholder="1d6" />
                                    </Form.Item>
                                </Tooltip>
                            </Col>
                            <Col span={7}>
                                <Form.Item
                                    name="threat_range"
                                    label="Threat Range"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonAfter="- 20"
                                        min={18}
                                        max={20}
                                        placeholder="18"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="crit_mult"
                                    label="Crit. Mult."
                                    rules={[
                                        {
                                            required: true,
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonBefore="x"
                                        min={2}
                                        max={4}
                                        placeholder="2"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="damage_type"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select an option.",
                                        },
                                    ]}
                                    label="Damage Type"
                                >
                                    <Select
                                        options={[
                                            {
                                                label: "Slashing",
                                                value: "Slashing",
                                                title: "",
                                            },
                                            {
                                                label: "Piercing",
                                                value: "Piercing",
                                                title: "",
                                            },
                                            {
                                                label: "Bludgeoning",
                                                value: "Bludgeoning",
                                                title: "",
                                            },
                                        ]}
                                        placeholder="Select an option"
                                        mode="multiple"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </PageContainer>
        </>
    );
}

export default BaseWaponListPage;
