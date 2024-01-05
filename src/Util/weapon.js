export const getDiceStr = (dice, removeD1 = false) => {
    let val = dice.rolls + "d" + dice.faces;

    if (removeD1 && dice.faces === 1) {
        return String(dice.rolls);
    }

    return val;
};

export const getWeaponBaseStr = (weaponBase) => {
    return (
        weaponBase.name +
        " (" +
        getDiceStr(weaponBase.damage) +
        ", " +
        (weaponBase.threat_range < 20
            ? weaponBase.threat_range + "-20"
            : "20") +
        ", x" +
        weaponBase.crit_multiplier +
        ", " +
        weaponBase.size +
        ")"
    );
};

export const getWeaponStr = (weapon) => {
    const threatRange = weapon.item_properties.find(
        (e) => e.ThreatRangeOverride !== undefined
    ).ThreatRangeOverride;

    const critMultiplier = weapon.item_properties.find(
        (e) => e.CriticalMultiplierOverride !== undefined
    ).CriticalMultiplierOverride;

    return (
        weapon.name +
        " (" +
        getDiceStr(weapon.base.damage) +
        ", " +
        (threatRange == 20 ? threatRange : threatRange + " - " + "20") +
        ", x" +
        critMultiplier +
        ", " +
        weapon.base.size +
        ")"
    );
};
