export const getWeaponBaseStr = (weaponBase, setName = true) => {
    return (setName
        ? weaponBase.name + " "
        : "") +
              "(" +
              weaponBase.damage.rolls +
              "d" +
              weaponBase.damage.faces +
              ", " +
              (weaponBase.threat_range < 20
                  ? weaponBase.threat_range + "-20"
                  : "20") +
              ", x" +
              weaponBase.crit_multiplier +
              ")";
};

export const getWeaponStr = (weapon) => {
    return weapon.name + " " + getWeaponBaseStr(weapon.base, false);
};
