import { Col, Row, Typography } from "antd";
import { getDiceStr } from "../Util/weapon";

const { Text } = Typography;

function ItemPropStats({ itemProperties, width }) {
    const itemProps = itemProperties
        .filter(
            (iprop, i) =>
                iprop.ThreatRangeOverride === undefined &&
                iprop.CriticalMultiplierOverride === undefined
        )
        .map((obj) => {
            const key = Object.keys(obj)[0];
            let iprop = obj[key];

            if (key == "DamageBonus") {
                return (
                    <Text
                        style={{
                            color: "white",
                        }}
                    >
                        <Text style={{ color: "inherit" }} strong>
                            Damage Bonus:
                        </Text>{" "}
                        {getDiceStr(iprop.amount, true)} {iprop.type_}
                    </Text>
                );
            } else if (key == "MassiveCrit") {
                return (
                    <Text
                        style={{
                            color: "white",
                        }}
                    >
                        <Text style={{ color: "inherit" }} strong>
                            Massive Critical:
                        </Text>{" "}
                        {getDiceStr(iprop, true)}
                    </Text>
                );
            }
        });

    if (itemProps.length < 1) itemProps.push("This weapon has no properties.");

    return (
        <Row
            style={{
                maxWidth: width || 200,
            }}
        >
            {itemProps.map((iprop, i) => (
                <Col key={"iprop-" + i} span={24}>
                    {iprop}
                </Col>
            ))}
        </Row>
    );
}

export default ItemPropStats;
