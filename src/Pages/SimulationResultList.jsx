import { invoke } from "@tauri-apps/api";
import { useEffect, useState, useContext } from "react";
import { Table } from "antd";
import {
    Typography,
    Space,
    Divider,
    Popconfirm,
    Row,
    Col,
    Result,
    Button,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import PageContainer from "../Sections/PageContainer";
import Loading from "../Components/Loading";
import HelpText, { LIST_SYMBOL } from "../Components/HelpText";
import TooltipDivider from "../Components/TooltipDivider";
import { AppContext } from "../App";
import { createWindow, windows } from "../Util/window";

const { Text, Link } = Typography;

function SimulationResultListPage() {
    const { showMessage } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [osLocale, setOsLocale] = useState([]);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");

    const textRenderer = (text) => <Text>{text}</Text>;
    const dateRenderer = (timestamp) => {
        const date = new Date(timestamp);

        return (
            date.toLocaleDateString(osLocale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }) +
            ", " +
            date.toLocaleTimeString(osLocale, {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const handleDeleteRecordClick = async (id) => {
        const res = await invoke("delete_row", {
            table: "simulation_results",
            id: id,
        });

        if (res.success) {
            showMessage("success", "The record is successfully deleted.");
            setTableData(tableData.filter((e) => e.id !== id));
        } else {
            showMessage(
                "error",
                "An error occured while deleting the record: " + res.msg
            );
        }
    };

    const handleDeleteAllRecordClick = async () => {
        const res = await invoke("delete_all_rows", {
            table: "simulation_results",
        });

        if (res.success) {
            showMessage("success", "All records are successfully deleted.");
            setTableData([]);
        } else {
            showMessage(
                "error",
                "An error occured while deleting all records: " + res.msg
            );
        }
    };

    const handleViewRecordClick = (id, record) => {
        createWindow(id, windows.result_viewer, record);
    };

    const cols = [
        {
            title: "ID",
            dataIndex: "id",
            defaultSortOrder: "descend",
            render: textRenderer,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Date",
            dataIndex: ["obj", "timestamp"],
            render: dateRenderer,
            sorter: (a, b) => a.obj.timestamp - b.obj.timestamp,
        },
        {
            title: "Details",
            render: (_, record) => (
                <HelpText
                    header={record.obj.data[0].result.total_rounds + " Rounds"}
                    items={record.obj.data.map((e) => e.character.name)}
                    footer={
                        <>
                            <TooltipDivider title="Target Information" />
                            <Row>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        AC:{" "}
                                    </Text>
                                    {Object.keys(
                                        record.obj.data[0].result.statistics
                                    ).join(", ")}
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Concealment:{" "}
                                    </Text>
                                    {record.obj.target_info.concealment}%
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Damage Immunity:{" "}
                                    </Text>
                                    {record.obj.target_info.damage_immunity}%
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Defensive Essence:{" "}
                                    </Text>
                                    {record.obj.target_info.defensive_essence}
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Has Epic Dodge:{" "}
                                    </Text>
                                    {record.obj.target_info.has_epic_dodge
                                        ? "Yes"
                                        : "No"}
                                </Col>
                            </Row>
                        </>
                    }
                >
                    Combat Information
                </HelpText>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_, record) => (
                <Space split={<Divider type="vertical" />}>
                    <Popconfirm
                        title="Warning"
                        description="Are you sure to delete this record?"
                        onConfirm={() => handleDeleteRecordClick(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <Link type="danger">delete</Link>
                    </Popconfirm>
                    <Link
                        type="success"
                        onClick={() =>
                            handleViewRecordClick(record.id, record.obj)
                        }
                    >
                        view
                    </Link>
                </Space>
            ),
        },
    ];

    // Load stuff
    useEffect(() => {
        async function func() {
            const [results] = await Promise.all([
                invoke("get_rows", {
                    table: "simulation_results",
                }),
            ]);

            setIsLoading(false);

            if (!results.success) {
                setErrorText(results.msg);
                setIsErrorOccured(true);
                return;
            }

            setTableData(
                results.result.map((e, i) => {
                    const temp = e;
                    e.key = i;
                    temp.obj = JSON.parse(e.json);

                    return temp;
                })
            );
        }

        func();
    }, []);

    return isLoading || isErrorOccured ? (
        <PageContainer>
            {isLoading && <Loading loading={isLoading} />}
            {isErrorOccured && (
                <Result
                    status="warning"
                    title="An error occured"
                    subTitle={errorText}
                />
            )}
        </PageContainer>
    ) : (
        <div style={{ position: "relative" }}>
            <Table
                pagination={{
                    pageSize: 6,
                    showSizeChanger: false,
                    style: { marginBottom: 0, paddingLeft: 126 },
                }}
                columns={cols}
                dataSource={tableData}
            />
            {tableData.length > 1 && (
                <Popconfirm
                    title="Warning"
                    description="Are you sure to delete all records?"
                    onConfirm={handleDeleteAllRecordClick}
                    okText="Yes"
                    cancelText="No"
                    placement="top"
                >
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        style={{ position: "absolute", left: 0, bottom: 0 }}
                        danger
                    >
                        Delete All
                    </Button>
                </Popconfirm>
            )}
        </div>
    );
}

export default SimulationResultListPage;
