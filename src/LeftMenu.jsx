import { useState } from "react";
import { Menu } from "antd";
import {
    CalculatorOutlined,
    TeamOutlined,
    UnorderedListOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import HomePage from "./Pages/Home";
import AboutPage from "./Pages/About";
import CharacterListPage from "./Pages/CharacterList";

function menuItem(label, key, icon, page, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
        page,
    };
}

const items = [
    menuItem("Calculator", "calculator", <CalculatorOutlined />, <HomePage />),
    menuItem("Character List", "character_list", <TeamOutlined />, <CharacterListPage />),
    menuItem("Weapon List", "weapon_list", <UnorderedListOutlined />),
    menuItem("About", "about", <InfoCircleOutlined />, <AboutPage />),

    // menuItem("Navigation Two", "sub2", <AppstoreOutlined />, [
    //     menuItem("Option 5", "5"),
    //     menuItem("Option 6", "6"),
    //     menuItem("Submenu", "sub3", null, [
    //         menuItem("Option 7", "7"),
    //         menuItem("Option 8", "8"),
    //     ]),
    // ]),
];

function LeftMenu({ theme, setCurrentPage }) {
    const [openKeys, setOpenKeys] = useState(["calculator"]);

    const onOpenChange = (keys) => {
        const openMenuKey = keys.find((key) => openKeys.indexOf(key) === -1);

        if (
            openMenuKey &&
            items.filter((item) => item.key === openMenuKey).length === 0
        ) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(openMenuKey ? [openMenuKey] : []);
        }
    };

    const onSelect = (e) => {
        const page = e.item.props.page;

        if (page !== undefined) setCurrentPage(page);
    };

    return (
        <Menu
            mode="inline"
            items={items}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onSelect={onSelect}
            defaultSelectedKeys={[items[0].key]}
            theme={theme}
        />
    );
}

export default LeftMenu;
