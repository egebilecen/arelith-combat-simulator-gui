import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

function Loading({ loading, ...props }) {
    return loading ? (
        <Spin
            indicator={<LoadingOutlined />}
            tip="Loading..."
            spinning={loading}
            {...props}
        >
            <p>
                <span style={{ opacity: 0 }}>Loading</span>&nbsp;
            </p>
        </Spin>
    ) : (
        <></>
    );
}

export default Loading;
