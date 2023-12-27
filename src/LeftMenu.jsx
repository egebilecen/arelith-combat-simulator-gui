import { useContext, useState } from "react";
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
import WeaponListPage from "./Pages/WeaponList";
import { AppContext } from "./App";

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
    menuItem("Simulator", "calculator", <CalculatorOutlined />, <HomePage />),
    menuItem(
        "Character List",
        "character_list",
        <TeamOutlined />,
        <CharacterListPage />
    ),
    menuItem(
        "Weapon List",
        "weapon_list",
        <UnorderedListOutlined />,
        <WeaponListPage />
    ),
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
    const { isSimulationInProgress, showMessage } = useContext(AppContext);
    const [openKeys, setOpenKeys] = useState(["calculator"]);
    const [currentPageKey, setCurrentPageKey] = useState(items[0].key);

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
        if (isSimulationInProgress) {
            showMessage("warning", "You cannot change pages while simulation is in-progress.");
            return;
        }

        const page = e.item.props.page;
        if (page !== undefined) {
            setCurrentPage(page);
            setCurrentPageKey(e.key);
        }
    };

    return (
        <Menu
            mode="inline"
            items={items}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onSelect={onSelect}
            selectedKeys={currentPageKey}
            theme={theme}
        />
    );
}

export default LeftMenu;
