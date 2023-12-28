import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

function Loading({ loading, ...props }) {
    return (
        <Spin
            indicator={<LoadingOutlined />}
            tip="Loading..."
            spinning={loading}
            {...props}
        >
            <p
                style={{
                    display: loading === true ? "block" : "none",
                }}
            >
                &nbsp;
            </p>
        </Spin>
    );
}

export default Loading;
