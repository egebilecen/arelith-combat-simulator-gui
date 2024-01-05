import { useContext, useState } from "react";
import { Menu } from "antd";
import {
    CalculatorOutlined,
    TeamOutlined,
    UnorderedListOutlined,
    InfoCircleOutlined,
    LineChartOutlined,
    GoldOutlined,
} from "@ant-design/icons";
import HomePage from "./Pages/Home";
import AboutPage from "./Pages/About";
import CharacterListPage from "./Pages/CharacterList";
import WeaponListPage from "./Pages/WeaponList";
import BaseWeaponListPage from "./Pages/BaseWeaponList";
import { AppContext } from "./App";
import SimulationResultListPage from "./Pages/SimulationResultList";

function _menuItem(label, key, icon, page, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
        page,
    };
}

export function getMenuItemFromRoute(route, _currentItem = undefined) {
    if (route.length === 0) {
        return _currentItem !== undefined ? _currentItem.page || <></> : <></>;
    }

    let menuItem = (
        _currentItem === undefined ? menuItems : _currentItem.children
    ).find((e) => e.key == route[0]);

    return getMenuItemFromRoute(route.slice(1), menuItem);
}

export const menuItems = [
    _menuItem("Simulator", "home", <CalculatorOutlined />, <HomePage />),
    _menuItem(
        "Results",
        "result_viewer",
        <LineChartOutlined />,
        <SimulationResultListPage />
    ),
    _menuItem(
        "Characters",
        "character_list",
        <TeamOutlined />,
        <CharacterListPage />
    ),
    _menuItem(
        "Weapons",
        "weapon_list",
        <UnorderedListOutlined />,
        <WeaponListPage />
    ),
    _menuItem(
        "Base Weapons",
        "base_weapon_list",
        <GoldOutlined />,
        <BaseWeaponListPage />
    ),
    _menuItem("About", "about", <InfoCircleOutlined />, <AboutPage />),

    // _menuItem("Sub-Menu 1", "sub-menu-1", null, null, [
    //     _menuItem("Sub-Menu 2", "sub-menu-2", null, null, [
    //         _menuItem("Sub-Menu 3", "sub-menu-3", null, null, [
    //             _menuItem(
    //                 "Sub-Sub-Sub 1",
    //                 "sub1-sub-menu-sub-menu-item-1",
    //                 null,
    //                 <>Sub-Sub-Sub 1</>
    //             ),
    //         ]),
    //         _menuItem(
    //             "Sub-Sub 1",
    //             "sub-sub-1",
    //             null,
    //             <>Sub-Sub 1</>
    //         ),
    //     ]),
    //     _menuItem("Sub 2", "sub2", null, <>Sub 2</>),
    //     _menuItem("Sub 3", "sub3", null, <>Sub 3</>),
    // ]),
];

function LeftMenu({ theme }) {
    const { pageRoute, setPageRoute, isSimulationInProgress, showMessage } =
        useContext(AppContext);
    const [subMenuRoute, setSubMenuRoute] = useState([]);

    const onOpenChange = (keys) => {
        setSubMenuRoute(keys);
    };

    const onSelect = (e) => {
        if (isSimulationInProgress) {
            showMessage(
                "warning",
                "You cannot change pages while simulation is in-progress."
            );
            return;
        }

        if (e.item.props.page) {
            const keyPath = e.keyPath.slice(1).reverse();
            setPageRoute([...keyPath, e.key]);
        }
    };

    return (
        <Menu
            mode="inline"
            items={menuItems}
            openKeys={subMenuRoute}
            selectedKeys={pageRoute}
            theme={theme}
            onOpenChange={onOpenChange}
            onSelect={onSelect}
        />
    );
}

export default LeftMenu;
