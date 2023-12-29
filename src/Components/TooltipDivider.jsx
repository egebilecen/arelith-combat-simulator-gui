import { Divider } from "antd";

function TooltipDivider({ title, style }) {
    return (
        <Divider
            style={{
                color: "inherit",
                borderBlockStart: "0 white",
                marginBottom: 0,
                fontSize: "inherit",
                ...style,
            }}
        >
            {title !== undefined && <span>{title}</span>}
        </Divider>
    );
}

export default TooltipDivider;
