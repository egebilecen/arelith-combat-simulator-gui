import { Row, Col, Typography, Divider } from "antd";
import ItemPropStats from "./ItemPropStats";
import { getWeaponBaseStr } from "../Util/weapon";

const { Text } = Typography;

function WeaponStats({ weapon, width }) {
    return (
        <Row
            style={{
                maxWidth: width || 200,
            }}
        >
            <Col span={24}>
                <Text
                    style={{
                        color: "inherit",
                        display: "block",
                        textAlign: "center",
                    }}
                >
                    {getWeaponBaseStr(weapon.base)}
                </Text>
            </Col>
            <Divider
                style={{
                    color: "inherit",
                    borderBlockStart: "0 white",
                    marginBottom: 0,
                    fontSize: "inherit",
                }}
            >
                <span>Item Properties</span>
            </Divider>
            <ItemPropStats itemProperties={weapon.item_properties} />
        </Row>
    );
}

export default WeaponStats;
