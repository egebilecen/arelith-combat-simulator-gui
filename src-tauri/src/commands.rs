use crate::db;
use arelith::{
    character::{AbilityList, Character},
    dice::Dice,
    feat::feat_db::get_feat,
    item::{
        weapon_db::{get_weapon_base, get_weapon_base_list},
        Damage, DamageType, ItemProperty, Weapon, WeaponBase,
    },
    size::SizeCategory,
};
use serde_json::Value;
use std::collections::HashMap;

#[tauri::command]
pub fn is_debug() -> bool {
    #[cfg(debug_assertions)]
    return true;

    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command]
pub fn get_row_by_id(table: &str, id: i32) -> db::QueryResult<db::RowData> {
    db::get_row_by_id(table, id)
}

#[tauri::command]
pub fn get_rows(table: &str) -> db::QueryResult<Vec<db::RowData>> {
    db::get_rows(&table)
}

#[tauri::command]
pub fn insert_row(table: &str, name: &str, json: &str) -> db::QueryResult<i64> {
    db::insert_row(table, name, json)
}

#[tauri::command]
pub fn delete_row(table: &str, id: i32) -> db::QueryResult<usize> {
    db::delete_row(table, id)
}

#[tauri::command]
pub fn get_base_weapons() -> HashMap<String, WeaponBase> {
    get_weapon_base_list()
}

#[tauri::command]
pub fn create_character(
    name: &str,
    size: &str,
    ab: i32,
    strength: i32,
    base_apr: i32,
    extra_apr: i32,
    weapon: Weapon,
    features: Vec<&str>,
) -> Character {
    fn to_size(size: &str) -> SizeCategory {
        match size.to_lowercase().as_str() {
            "tiny" => SizeCategory::Tiny,
            "small" => SizeCategory::Small,
            "medium" => SizeCategory::Medium,
            "large" => SizeCategory::Large,
            "huge" => SizeCategory::Huge,
            _ => SizeCategory::Medium,
        }
    }

    let mut builder = Character::builder()
        .name(name.to_string())
        .size(to_size(size))
        .abilities(AbilityList::builder().str(strength).build())
        .ab(ab)
        .base_apr(base_apr)
        .extra_apr(extra_apr)
        .weapon(weapon);

    for feature in features {
        builder = builder.add_feat(get_feat(feature));
    }

    builder.build()
}

#[tauri::command]
pub fn create_weapon(
    name: &str,
    base_weapon: &str,
    threat_range: i32,
    crit_mult: i32,
    item_props: Vec<Value>,
) -> Weapon {
    fn to_damage_type(dmg_type: &str) -> DamageType {
        match dmg_type.to_lowercase().as_str() {
            "slashing" => DamageType::Slashing,
            "piercing" => DamageType::Piercing,
            "bludgeoning" => DamageType::Bludgeoning,
            "magical" => DamageType::Magical,
            "acid" => DamageType::Acid,
            "cold" => DamageType::Cold,
            "divine" => DamageType::Divine,
            "electrical" => DamageType::Electrical,
            "fire" => DamageType::Fire,
            "negative" => DamageType::Negative,
            "positive" => DamageType::Positive,
            "sonic" => DamageType::Sonic,
            "entropy" => DamageType::Entropy,
            "force" => DamageType::Force,
            "psychic" => DamageType::Psychic,
            "poison" => DamageType::Poison,
            _ => DamageType::Slashing,
        }
    }

    let mut iprops = vec![
        ItemProperty::ThreatRangeOverride(threat_range),
        ItemProperty::CriticalMultiplierOverride(crit_mult),
    ];

    for obj in item_props.iter() {
        let type_ = obj["type"].as_str().unwrap();

        match type_ {
            "Damage Bonus" => {
                let val = obj["value"].as_str().unwrap();
                let dmg_type = obj["extra"].as_str().unwrap();
                let dmg_props: Vec<&str> = obj["dmg_props"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .map(|e| e.as_str().unwrap())
                    .collect();

                let can_crit = dmg_props.contains(&"can_crit");
                let is_resistable = dmg_props.contains(&"resistable");

                iprops.push(ItemProperty::DamageBonus(Damage::new(
                    to_damage_type(dmg_type),
                    if val.contains("d") {
                        Dice::from(val)
                    } else {
                        Dice::from(val.parse::<i32>().unwrap())
                    },
                    is_resistable,
                    can_crit,
                )));
            }
            "Massive Critical" => {
                let val = obj["value"].as_str().unwrap();

                iprops.push(ItemProperty::MassiveCrit(if val.contains("d") {
                    Dice::from(val)
                } else {
                    Dice::from(val.parse::<i32>().unwrap())
                }));
            }
            _ => (),
        }
    }

    Weapon::new(name.to_string(), get_weapon_base(base_weapon), iprops)
}

#[tauri::command]
pub fn test() -> Weapon {
    Weapon::new(
        "Weapon Name".into(),
        get_weapon_base("Bastard Sword"),
        vec![ItemProperty::DamageBonus(Damage::new(
            DamageType::Bludgeoning,
            Dice::from("1d6"),
            true,
            true,
        ))],
    )
}
