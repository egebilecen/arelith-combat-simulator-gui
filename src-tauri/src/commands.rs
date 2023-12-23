use crate::db;
use arelith::{item::{
    weapon_db::{get_weapon_base, get_weapon_base_list},
    Damage, DamageType, ItemProperty, Weapon, WeaponBase,
}, dice::Dice};
use std::collections::HashMap;

#[tauri::command]
pub fn is_debug() -> bool {
    #[cfg(debug_assertions)]
    return true;

    #[cfg(not(debug_assertions))]
    return false;
}

#[tauri::command]
pub fn get_rows(table: &str) -> db::QueryResult<Vec<db::RowData>> {
    db::get_rows(&table)
}

#[tauri::command]
pub fn insert_row(table: &str, name: &str, json: &str) -> db::QueryResult<usize> {
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
