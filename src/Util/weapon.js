export const getDiceStr = (dice, removeD1 = false) => {
    let val = dice.rolls + "d" + dice.faces;

    if (removeD1 && dice.faces === 1) {
        return String(dice.rolls);
    }

    return val;
};

export const getWeaponBaseStr = (weaponBase, setName = true) => {
    return (
        (setName ? weaponBase.name + " " : "") +
        "(" +
        getDiceStr(weaponBase.damage) +
        ", " +
        (weaponBase.threat_range < 20
            ? weaponBase.threat_range + "-20"
            : "20") +
        ", x" +
        weaponBase.crit_multiplier +
        ")"
    );
};

export const getWeaponStr = (weapon) => {
    return weapon.name + " " + getWeaponBaseStr(weapon.base, false);
};
